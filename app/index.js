'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var fs = require('fs');

function copyTgmStyles () {
  console.log('Copying default TGM styles...');

  var scssFiles = ['colors', 'type', 'mixins', 'layout', 'responsive'];
  var appDir = process.cwd() + '/app';

  scssFiles.forEach(function (fileEnding) {
    var inScss = '/bower_components/tgm-styles/scss/_tgm-' + fileEnding + '.scss';
    var outScss = '/styles/_app-' + fileEnding + '.scss';
    var inPath = appDir + inScss;
    var outPath = appDir + outScss;
    fs.readFile(inPath, 'utf8', function (err, data) {
      if (err) return console.log(err);
      var replaceDefault = data.replace(/\s\!default/g, '');

      fs.writeFile(outPath, replaceDefault, 'utf8', function (err) {
        if (err) return console.log(err);
        console.log('copied: ' + inScss + ' --> ' + outScss);
      });
    });
  });
}

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
  //this.copy('_copy-tgm-styles', 'copy-tgm-styles');
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
  var bs;

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.indexFile = this.engine(this.indexFile, this);
  this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
    'scripts/main.js'
  ]);

  if (this.compassBootstrap) {
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
  else {
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
    skipInstall: this.options['skip-install'],
    callback: function () {
      copyTgmStyles();
    }.bind(this)
  });
};
