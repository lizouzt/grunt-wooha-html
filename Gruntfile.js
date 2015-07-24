module.exports = function (grunt) {
    grunt.initConfig({
        wooha_html: {
            dist: {
                cwd: 'demo',
                src: ['**/*.html', '!**/*.jst.html'],
                dest: 'html',
                options: {
                    env: "dev",//["dev", "pro"]
                    version: "0.1.0",
                    build: "build",//grunt build folder, default is "build"
                    main: "index",//main js file, default is index.js
                    beautify: true
                }
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['wooha_html']);
};
