/*global describe, beforeEach, it*/

var path    = require('path');
var helpers = require('yeoman-generator').test;
var assert  = require('assert');
var fs = require('fs');


describe('Webapp generator test', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.webapp = helpers.createGenerator('webapp:app', [
        '../../app', [
          helpers.createDummyGenerator(),
          'mocha:app'
        ]
      ]);
      done();
    }.bind(this));
  });

  it('the generator can be required without throwing', function () {
    // not testing the actual run of generators yet
    this.app = require('../app');
  });

  it('should add the CDN update configuration', function (done) {
    // not testing the actual run of generators yet
    this.app = require('../app');
    helpers.mockPrompt(this.webapp, {
      project: 'test-app'
    });
    this.webapp.options['skip-install'] = true;
    this.webapp.run({}, function () {
      helpers.assertFile('GruntFile.js', /cdn: 'http:\/\/test-app\.theglobalmail\.org/);
      done();
    });
  });

  it('creates expected files in AMD mode', function (done) {
    var expected= [
      ['bower.json', /"name": "temp"/],
      ['package.json', /"name": "temp"/],
      'Gruntfile.js',
      'app/favicon.ico',
      'app/robots.txt',
      'app/index.html',
      ['app/scripts/main.js', /require\.config/],
      'app/styles/main.scss',
      'app/images/loader.svg'
    ];

    helpers.mockPrompt(this.webapp, {
      project: 'test-app'
    });

    this.webapp.options['skip-install'] = true;
    this.webapp.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });
});
