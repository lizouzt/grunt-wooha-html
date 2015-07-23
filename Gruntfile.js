module.exports = function (grunt) {
    grunt.initConfig({
        fixturesPath: "build",

        htmlbuild: {
            dist: {
                src: './test.html',
                dest: './html/',
                options: {
                    allowUnknownTags: true,
                    relative: true,
                    data: {
                        version: "0.1.0",
                        title: "test",
                    },
                }
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['htmlbuild']);
};
