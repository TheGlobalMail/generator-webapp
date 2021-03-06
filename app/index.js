'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var copyTgmStyles = require('./copyTgmStyles');


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
  options['test-framework'] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', {
    as: 'app',
    options: {
      options: {
        'skip-install': options['skip-install-message'],
        'skip-message': options['skip-install']
      }
    }
  });

  this.options = options;

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  var projectTypeChoices = [
    { name: 'Webapp', value: 'webapp', },
    { name: 'Embedded iframe', value: 'iframe' }
  ];

  var bowerChoices = [
    { value: 'jquery#1.10.2', checked: true },
    { name: 'tgm-styles (deps: sass-bootstrap)', value: 'git@github.com:TheGlobalMail/tgm-styles.git', checked: true},
    { name: 'highcharts' },
    { name: 'd3' },
    { name: 'jquery.scrollTo' },
    { name: 'lodash' },
    { name: 'font-awesome' }
  ];


  // welcome message
  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
    console.log('This is the generator for news apps and visualisations for The Global Mail.');
  }

  var prompts = [
    {
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
    },
    {
      name: 'projectType',
      type: 'list',
      message: 'What type of project is this?',
      required: true,
      default: 'webapp',
      choices: projectTypeChoices
    },
    {
      name: 'bowerOpts',
      type: 'checkbox',
      message: 'Which libraries shall we install?',
      choices: bowerChoices
    }
  ];

  this.prompt(prompts, function (answers) {
    this.project = answers.project;
    this.projectType = answers.projectType;
    this.bowerOpts = answers.bowerOpts;
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
  this.bowerInstall(this.bowerOpts, { save: true }, copyTgmStyles);
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
    this.template('./scss/main.scss', 'app/styles/main.scss');
    this.copy('./scss/_app.scss', 'app/styles/_app.scss');
    this.copy('./scss/_app-variables.scss', 'app/styles/_app-variables.scss');
  } else {
    this.copy('main.css', 'app/styles/main.css');
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  var bs;

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
    bs = 'bower_components/sass-bootstrap/js/';
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      bs + 'affix.js',
      bs + 'alert.js',
      bs + 'dropdown.js',
      bs + 'tooltip.js',
      bs + 'modal.js',
      bs + 'transition.js',
      bs + 'button.js',
      bs + 'popover.js',
      bs + 'carousel.js',
      bs + 'scrollspy.js',
      bs + 'collapse.js',
      bs + 'tab.js'
    ]);
  }
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (!this.includeRequireJS) {
    return;
  }

  this.indexFile = this.append(this.indexFile, 'body', '\n        <!-- build:js scripts/main.js -->' );
  this.indexFile = this.append(this.indexFile, 'body', '\n        <script data-main="scripts/main" src="bower_components/requirejs/require.js"></script> ');
  this.indexFile = this.append(this.indexFile, 'body', '\n        <!-- endbuild -->\n ');

  // add a basic amd module
  this.write('app/scripts/app.js', [
    '/*global define */',
    'define([], function () {',
    ' \'use strict\';\n',
    ' return \'\\\'Allo \\\'Allo!\';',
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
    this.write(
      'app/scripts/main.coffee',
      'console.log "\'Allo from CoffeeScript!"'
    );
  }

  if (!this.includeRequireJS) {
    this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
  }
};

AppGenerator.prototype.install = function () {
  if (this.options['skip-install']) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install']
  });
};
