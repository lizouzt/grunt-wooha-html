# grunt-wooha-html

> self fed dev craft with bower,grunt,require HTML build plugin.
> 
> this plugin is used for version control,html compress,js\css inject.

## Update log
* Version 2.0.2 add module.exports support with browserify

## Getting Started
This plugin requires Grunt `~0.4.5`

```shell
npm install grunt-wooha-html --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-wooha-html');
```

## The "wooha_html" task

### Overview
In your project's Gruntfile, add a section named `wooha_html` to the data object passed into `grunt.initConfig()`.

```
    grunt.initConfig({
    	wooha_html: {
	      options: {
	      
	      }
  		}
  	});
```

### inject script or stylesheet
If you want inject some js or css file in html, You just need add a "inject" attribute on script tag of html.

```
	<script src="***" inject></script>
	<link rel="stylesheet" type="text/css" href="***" inject>
```

### Options Quick Reference

| Option                         | Description     | Default |
|--------------------------------|-----------------|---------|
|exportMode| is this project use 1:module.exports or 2:CMD or 3:react| 1 |
|env| which environment build for | 'pro' |
| build |grunt build folder| 'build' |
|version|version code | '' with out version control |
|main|page main js file | index.js |
|beautify|beautify html file| false|
|minify|html-minifier options.The minify option is useless when option beautify is true.More information see[html-minifier](https://www.npmjs.com/package/html-minifier)| object|

### Usage
CommonJS mode
```
  wooha_html: {
      dist: {
        cwd: './demo/',
        src: ['**/*.html', '!**/*.jst.html'],
        dest: './html/',
        options: {
          version: '<%= version %>',
          env: '<%= env %>',
          build: "<%= buildBase %>",
          src: "<%= srcBase %>",
          main: "index",
          exportMode: 2,
          minify: {
              preserveLineBreaks: true,
              minifyCSS: true,
              minifyJS: true,
              maxLineLength: 1024
          },
          beautify: false
        }
      }
  }
```

Browserify module.exports mode
```
    wooha_html: {
      dist: {
        cwd: './demo/',
        src: ['**/*.html', '!**/*.jst.html'],
        dest: './html/',
        options: {
          exportMode: 1,
          version: '<%= version %>',
          minify: {
              preserveLineBreaks: true,
              minifyCSS: true,
              minifyJS: true,
              maxLineLength: 1024
          },
          processContent: function (html) {
            /*
            * 统计代码注入
            * */
            return html;
          }
        }
      }
    }
```

React web mode
```
    wooha_html: {
      dist: {
        cwd: './demo/',
        src: ['**/*.html', '!**/*.jst.html', "!ueditor/**/*.html"],
        dest: './html/',
        options: {
          version: '<%= version %>',
          exportMode: 3,
          minify: {
              preserveLineBreaks: true,
              minifyCSS: true,
              minifyJS: true,
              maxLineLength: 1024
          },
          beautify: true,
          processContent: function (html) {
            /*
            * 统计代码注入
            * */
            return html;
          }
        }
      }
    }
```

### Project orga

- root
	- build -- build code folder
    - html -- built html folder
    - demo -- dev html folder
    - src
        - c -- lib folder
        - p -- page folder

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
