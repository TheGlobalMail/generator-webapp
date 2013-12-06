'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';
  this.coffee = options.coffee;

  // Deafults for project
  this.compassBootstrap = true;
  this.includeRequireJS = true;
  this.includeModernizr = true;

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';

  this.on('end', function () {
    this.installDependencies({
      skipInstall: options['skip-install'],
      skipMessage: options['skip-install-message']
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
    console.log('This is the generator for news apps and visualisations for The Global Mail.');
  }

  var prompts = [{
    name: 'project',
    message: 'What is the short name for the project?',
    default: this.appname.replace(/ /g, '-'),
    required: true,
    validate: function(input){
      if (!input.match(/^[a-zA-Z0-9-_]+$/)){
        return 'Only use alphanumerics and dashes and underscores';
      }
      return true;
    }
  }];

  this.prompt(prompts, function (answers) {
    this.project = answers.project;
    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', 'app/favicon.ico');
  this.copy('robots.txt', 'app/robots.txt');
};

AppGenerator.prototype.images = function images() {
  this.directory('images', 'app/images/');
};

AppGenerator.prototype.aws = function aws() {
  this.copy('aws-config.json', 'aws-config.json');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.compassBootstrap) {
    this.directory('./scss', 'app/styles');
  } else {
    this.copy('main.css', 'app/styles/main.css');
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.indexFile = this.engine(this.indexFile, this);

  if (!this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
      'scripts/main.js'
    ]);

    if (this.coffee) {
      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/coffee.js',
        sourceFileList: ['scripts/hello.js'],
        searchPath: '.tmp'
      });
    }
  }

  if (this.compassBootstrap && !this.includeRequireJS) {
    // wire Twitter Bootstrap plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      'bower_components/sass-bootstrap/js/affix.js',
      'bower_components/sass-bootstrap/js/alert.js',
      'bower_components/sass-bootstrap/js/dropdown.js',
      'bower_components/sass-bootstrap/js/tooltip.js',
      'bower_components/sass-bootstrap/js/modal.js',
      'bower_components/sass-bootstrap/js/transition.js',
      'bower_components/sass-bootstrap/js/button.js',
      'bower_components/sass-bootstrap/js/popover.js',
      'bower_components/sass-bootstrap/js/carousel.js',
      'bower_components/sass-bootstrap/js/scrollspy.js',
      'bower_components/sass-bootstrap/js/collapse.js',
      'bower_components/sass-bootstrap/js/tab.js'
    ]);
  }
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (!this.includeRequireJS) {
    return;
  }

  this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
    'data-main': 'scripts/main'
  });

  // add a basic amd module
  this.write('app/scripts/app.js', [
    '/*global define */',
    'define([], function () {',
    '    \'use strict\';\n',
    '    return \'\\\'Allo \\\'Allo!\';',
    '});'
  ].join('\n'));

  this.template('require_main.js', 'app/scripts/main.js');
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);

  if (this.coffee) {
    this.write('app/scripts/hello.coffee', this.mainCoffeeFile);
  }

  if (!this.includeRequireJS) {
    this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
  }
};
