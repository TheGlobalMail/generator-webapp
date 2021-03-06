# The Global Mail Web app generator

Yeoman generator that scaffolds out a front-end web app for The Global Mail
news apps and visualisations.

How to use:

  1. `git clone git@github.com:TheGlobalMail/generator-webapp.git
  generator-tgm-webapp`
  2. `cd generator-tgm-webapp`
  3. `npm link`
  4. `mkdir new-project && cd new-project`
  5. `yo tgm-webapp`

## TODO

* Add favicon
* fix cdn 
* make grunt check whether we were too lazy to add facebook/analytics
* more work setting solid css defaults in [tgm-styles](https://github.com/TheGlobalMail/tgm-styles)
* grunt:setup for buckets, dns and cdn


## MAYBE?

* similar to styles repo, develop repo of js widgets (eg Sri Lanka nav, parallax)
* iframe-specific css for embedded charts and such
* add sharing (lazy load) 


## DONE?

* add header
* add deploy to aws
* prompt asking which bower things you want
* prompt that scaffolds out either embedded iframe or webapp html/css

## Features

* CSS Autoprefixing (new)
* Built-in preview server with LiveReload
* Automagically compile CoffeeScript & Compass
* Automagically lint your scripts
* Automagically wire up your Bower components with [bower-install](https://github.com/stephenplusplus/grunt-bower-install).
* Awesome Image Optimization (via OptiPNG, pngquant, jpegtran and gifsicle)
* Mocha Unit Testing with PhantomJS
* Optional - Twitter Bootstrap for SASS
* Optional - Leaner Modernizr builds (new)

For more information on what `generator-webapp` can do for you, take a look at the [Grunt tasks](https://github.com/yeoman/generator-webapp/blob/master/app/templates/_package.json) used in our `package.json`.

## Getting Started

- Install: `npm install -g generator-webapp`
- Run: `yo webapp`
- Run `grunt` for building and `grunt serve` for preview

Note: `grunt server` was previously used for previewing in earlier versions of the project and is being deprecated in favor of `grunt serve`.

## Options

* `--skip-install`

  Skips the automatic execution of `bower` and `npm` after scaffolding has finished.

* `--test-framework=<framework>`

  Defaults to `mocha`. Can be switched for another supported testing framework like `jasmine`.

* `--coffee`

  Add support for [CoffeeScript](http://coffeescript.org/).

## Contribute

See the [contributing docs](https://github.com/yeoman/yeoman/blob/master/contributing.md)

Note: We are regularly asked whether we can add or take away features. If a change is good enough to have a positive impact on all users, we are happy to consider it.

If not, `generator-webapp` is fork-friendly and you can always maintain a custom version which you `npm install && npm link` to continue using via `yo webapp` or a name of your choosing.


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)


