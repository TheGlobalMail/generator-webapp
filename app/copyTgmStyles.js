var fs = require('fs');

module.exports = function () {

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
