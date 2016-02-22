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
        minify = require('html-minifier').minify,
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
            return a.replace(b, params.version ? 'build/'+params.version : 'build');
        });

        params.version && (content = content.replace(/requirejs.config\(\{([\S\W]+)\}\)\;/, function(a, b){
            var endk = a.search(/\}\)/);
            var part = [a.slice(0, endk), a.slice(endk)];

            var change = part[0].replace(/\.\.\/deps\//g, function(a){
                return '../../deps/'
            });
            return change + part[1]
        }));

        /*
         * open concat js
         * */
        var prePath = "./";
        var pathDeep = src.split('/').length - 1,
            // Just fit for one level p folder
            /*
            *   support windows os
            **/
            route = (src.match(/(.*[\\\/]|^)(.+)\.html/) || [])[2],
            jsFile = params.main + (params.env == "dev" ? ".org.js" : ".js");

        !route && grunt.log.warn("Source html inject concat js failed. Path: " + src);

        for ( ; pathDeep > 0; pathDeep--) prePath += "../";

        var basePath = prePath + params.build + '/' + params.version + "/p/";
        var buildJsPath = path.join(basePath, route, jsFile);
        var srcJsPath = path.join(prePath, params.src, 'p', route, params.main + '.js');

        content = RegExp(srcJsPath).test(content) ? content.replace(srcJsPath, buildJsPath) : content.replace(/<\/html>/, function(html){
            return '<script src="'+buildJsPath+'"><\/script>' + html;
        });

        return content;
    }

    function injectSource(tag, htmlPath) {
        var isScript = /<\/script>/.test(tag);
        var flag = isScript ? 'src' : 'href';
        var src = (tag.match(RegExp(' '+flag+'=[\"\'](.+)[\"\']')) || [])[1], ret = tag;
        if (!!src) {
            if (!path.isAbsolute(src) && src.indexOf('//') == -1)
                /*
                *   support windows os
                **/
                src = src.split('../').slice(htmlPath.match(/[a-zA-Z_]+[\/\\]/g).length - 1).join('')

            if (!grunt.file.exists(src)) {
                grunt.log.warn('Source file "' + src + '" not found.');
                return false;
            }

            var content = grunt.file.read(src);
            ret = isScript ? tag.replace(/\ssrc=["'].+["']/, '').replace("inject", "").replace(/><\/script>/, function(){
                return '>\r\n' + content + '</script>';
            }) : '\r\n<style>' + content + '</style>'
        }

        return ret;
    }

    function minifyHTML(content, options) {
        return minify(content, options);
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

            if ( /\sinject/.test(tag) ) {
                result = injectSource(tag, src);
            } else {
                var csrc = (tag.match(regSrc) || [])[2];
                if (csrc && csrc.indexOf('http') == -1) {
                    nsrc = csrc.replace(/(\/|^)build\//, function(ret){
                        return ret + version + '/'
                    });
                    result = tag.replace(csrc, nsrc);
                }
            }

            result && (content = content.replace(tag, result));
        });

        params.isCMD && (content = extraTransform(content, params, src));

        if (params.beautify) {
            content = beautify.html(content, _.isObject(params.beautify) ? params.beautify : {});
        } else if (params.minify) {
            content = minifyHTML(content, params.minify);
        }

        return content;
    }

    grunt.registerMultiTask('wooha_html', "Grunt HTML Builder", function () {
        var params = this.options({
            isCMD: true,
            env: 'pro',
            build: 'build',
            version: '',
            build: "build",
            main: "index",
            beautify: false,
            minify: {},
            processContent: function (src) { return src; }
        });

        !params.beautify && (params.minify = _.extend({
            removeAttributeQuotes: true,
            removeComments: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            preserveLineBreaks: false,
            removeEmptyAttributes: true,
            removeIgnored: false,
            keepClosingSlash: true,
            minifyCSS: true,
            minifyJS: true,
            maxLineLength: 2028
        }, params.minify));

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
