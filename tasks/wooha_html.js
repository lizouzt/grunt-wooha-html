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

    function extraTransform(content, params, src) {
        /*
        * change requirejs baseUrl
        * */
        content = content.replace(/baseUrl\:.+\/(src)\/["']/, function(a, b){
            return a.replace(b, 'build');
        });

        /*
        * inject concat js
        * */
        var prePath = "./";
        var pathDeep = src.split('/').length - 1,
            route = (src.match(/(.*\/|^)(.+\/.*)\.html/) || [])[2],
            jsFile = params.main + (params.env == "dev" ? ".org.js" : ".js");

        !route && grunt.log.warn("Source html inject concat js failed. Path: " + src);

        for ( ; pathDeep > 0; pathDeep--) prePath += "../";
        prePath += params.build + '/' + params.version + "/p/";
        var mainJsPath = path.join(prePath, route, jsFile);

        content = content.replace(/<\/body>/, function(a){
            return a + '<script src="'+mainJsPath+'"><\/script>';
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

    function transformContent(content, params, src) {
        var tags = getBuildTags(content),
            version = params.version;

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

        content = extraTransform(content, params, src);

        if (params.beautify) {
            content = beautify.html(content, _.isObject(params.beautify) ? params.beautify : {});
        }

        return content;
    }

    grunt.registerMultiTask('wooha_html', "Grunt HTML Builder", function () {
        var params = this.options({
            env: 'pro',
            build: 'build',
            version: '0.0.0',
            build: "build",
            main: "index",
            beautify: true,
            processContent: function (src) { return src; }
        });

        this.files.forEach(function (file) {
            var isExpanded = file.orig.expand || false;

            file.src.forEach(function (src) {
                var srcPath = isExpanded ? src : path.join(file.cwd, src),
                    destPath = isExpanded ? file.dest : path.join(file.dest, src);

                if (!grunt.file.exists(srcPath)) {
                    grunt.log.warn('Source file "' + src + '" not found.');
                    return false;
                }

                content = transformContent(grunt.file.read(srcPath), params, srcPath);

                content = params.processContent(content);

                grunt.file.write(destPath, content);
                grunt.log.ok("File " + destPath + " created !");
            });
        });
    });
};
