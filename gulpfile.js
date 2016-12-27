var gulp = require('gulp')
var npawify = require('gulp-npawify')
var fs = require('fs')
var pkg = require('./package.json')
var lib = require('youboralib')

var license = '/**' +
  '\n * @license ' + pkg.license +
  '\n * ' + pkg.name + ' ' + pkg.version +
  '\n * Packed with youboralib ' + lib.VERSION +
  '\n * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>' +
  '\n * @author ' + pkg.author +
  '\n */' +
  '\n'

var options = {
  entry: './src/sp.js',
  output: 'sp.min.js',
  standalone: 'youbora',
  license: license
}

gulp.task('build', ['manifest'], npawify(options))
gulp.task('watch', ['manifest'], npawify(npawify.assign({}, options, { watch: true })))
gulp.task('default', ['build'])

gulp.task('manifest', function () {
  var file = fs.readFileSync('src/adapter.js')
  var allgetters = [
    'getPlayhead',
    'getPlayrate',
    'getFramesPerSecond',
    'getDroppedFrames',
    'getDuration',
    'getBitrate',
    'getThroughput',
    'getRendition',
    'getTitle',
    'getTitle2',
    'getIsLive',
    'getResource',
    'getPosition'
  ]
  var getters = []
  for (var i = 0; i < allgetters.length; i++) {
    var element = allgetters[i]
    if (file.indexOf(element) !== -1) {
      getters.push(element)
    }
  }

  var manifest = {
    name: pkg.name,
    type: 'adapter',
    tech: 'js',
    author: pkg.author,
    version: pkg.version,
    libVersion: lib.VERSION,
    built: new Date().toDateString(),
    features: {
      buffer: file.indexOf('fireBufferBegin') !== -1 ? 'native' : 'monitor',
      seek: file.indexOf('fireSeekBegin') !== -1 ? 'native' : 'monitor',
      getters: getters
    }
  }
  fs.writeFile('./manifest.json', JSON.stringify(manifest, null, '  '), { mode: '664' })
})
