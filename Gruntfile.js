module.exports = (grunt) => {
    // Load the plugins that provide the tasks.
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-nodeunit');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.loadNpmTasks('jshint-stylish');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.main %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
                sourceMap: true
            },
            build: {
                src: 'sw.js',
                dest: 'build/<%= pkg.main %>.min.js'
            }
        },
        nodeunit: {
            all: ['test/*_test.js']
        },
        cssmin: {
            compress: {
                files: {
                    'build/main.css': ['*.css']
                }
            }
        },
        jshint: {
            options: {
                esversion: 6,
                reporter: require('jshint-stylish')
            },
            all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
        },
        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['default'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'cssmin', 'jshint']);
    grunt.registerTask('foo', ['cssmin', 'jshint']);
};
