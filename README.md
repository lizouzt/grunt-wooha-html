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

```

	grunt.initConfig({

	wooha_html:{

      dist:{
          
          cwd: 'demo',
          
          src: ["**/*.html", "!**/*.jst.html"],
          
          dest: "html",
          
          options: {
              exportMode: true,
              env: "<%= dev %>",
              version: "0.1.0",
              build: "build",
              src: "src",
              main: "index",
              minify: {              
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
              beautify: false
          }
      }
    }});
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
