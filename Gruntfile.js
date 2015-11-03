module.exports = function (grunt) {
    grunt.initConfig({
        wooha_html: {
            dist: {
                cwd: 'demo',
                src: ['**/*.html', '!**/*.jst.html'],
                dest: 'html',
                options: {
                    env: "dev",//["dev", "pro"]
                    version: "0.1.0",//version, default is null
                    build: "build",//grunt build folder, default is "build"
                    src: "src",//grunt src folder, default is "src"
                    main: "index",//main js file, default is "index.js"
                    minify: {
                        /*
                        * html-minifier options
                        * The minify option is useless when option beautify is true
                        * down here are default configures
                        * */
                        removeAttributeQuotes: true, //default true
                        removeComments: true, //default true
                        collapseWhitespace: true, //default true
                        conservativeCollapse: true, //default true
                        preserveLineBreaks: false, //default false
                        removeEmptyAttributes: true, //default true
                        removeIgnored: true, //default true
                        minifyCSS: true, //default true
                        minifyJS: true, //default true
                        maxLineLength: 2048 //default 2048
                    },
                    beautify: false//beautify html file, default false
                }
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['wooha_html']);
};
