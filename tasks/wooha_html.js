/*
 * grunt-wooha-html
 * https://github.com/lizouzt/grunt-wooha-html
 *
 * Copyright (c) 2015 wooha
 * Licensed under the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

module.exports = function (grunt) {
    //#region Global Properties

    var // Init
        _ = grunt.util._,
        EOL = grunt.util.linefeed,
        URL = require('url'),
        path = require('path'),
        beautifier = require('js-beautify'),
        beautify = {
            js: beautifier.js,
            css: beautifier.css,
            html: beautifier.html
        },

        regexTagStart = /\<(script|link)/,
        regexEnd = {
            script: /<\/script>/,
            link: /.>/
        },
        regSrc = /(src|href)\=["']([^\s]+)["']/,
        isFileRegex = /\.(\w+){2,4}$/;

    function extraTransform(content) {
        /*
        * change requirejs baseUrl
        * */
        content = content.replace(/baseUrl\:.+\/(src)\/["']/, function(a, b){
            return a.replace(b, 'build');
        });

        /*
        * open concat js
        * */
        content = content.replace(/\<\!--\s*(\<script[^>]+\>\<\/script\>)\s*--\>/, function(a, b){
            return b;
        });

        return content;
    }

    function getBuildTags(content) {
        var lines = content.replace(/\r?\n/g, '\n').split(/\n/),
            tags = [],
            last = [],
            tagStart= '';

        var departTags = function (l){
            tagStart = tagStart || (l.match(regexTagStart) || [])[1];

            if (tagStart) {
                var tagEnd = (l.match(regexEnd[tagStart]) || [])[0];
                if (tagEnd) {
                    var seq = l.search(tagEnd) + tagEnd.length;
                    var parts = [l.slice(0, seq),l.slice(seq)]

                    last.push(parts[0]);
                    tags.push(last.join(''));

                    last.length = 0;
                    tagStart = '';

                    if (parts[1])
                        departTags(parts[1]);
                } else {
                    last.push(l);
                }
            } else if (last.length != 0) {
                last.push(l);
            }
        };

        lines.forEach(function (l) {
            departTags(l);
        });

        return tags;
    }

    function transformContent(content, params, dest) {
        var tags = getBuildTags(content),
            config = grunt.config(),
            version = params.data.version;

        tags.forEach(function (tag) {
            /*
            * do what u want.
            * */
            var result = '';

            if ( /inject="yeah"/.test(tag) ) {
                result = tag;
            } else {
                var src = (tag.match(regSrc) || [])[2];
                if (src && src.indexOf('http') == -1) {
                    nsrc = src.replace(/(\/|^)build\//, function(ret){
                        return ret + version + '/'
                    });
                    result = tag.replace(src, nsrc);
                }
            }

            result && (content = content.replace(tag, result));
        });

        content = extraTransform(content);

        if (params.beautify) {
            content = beautify.html(content, _.isObject(params.beautify) ? params.beautify : {});
        }

        return content;
    }

    grunt.registerMultiTask('htmlbuild', "Grunt HTML Builder", function () {
        var params = this.options({
            beautify: true,
            data: {
                version: '0.0.0'
            },
            prefix: '',
            relative: true
        });

        this.files.forEach(function (file) {
            var dest = file.dest || "",
                destPath, content;

            file.src.forEach(function (src) {
                if (params.replace) {
                    destPath = src;
                }
                else if (isFileRegex.test(dest)) {
                    destPath = dest;
                }
                else {
                    destPath = path.join(dest, path.basename(src));
                }

                content = transformContent(grunt.file.read(src), params, dest);

                // write the contents to destination
                grunt.file.write(destPath, content);
                grunt.log.ok("File " + destPath + " created !");
            });
        });
    });
};
