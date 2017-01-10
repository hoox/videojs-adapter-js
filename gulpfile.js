var gulp = require('gulp')
var npawify = require('gulp-npawify')
var fs = require('fs')
var path = require('path')
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
gulp.task('watch', ['manifest'], npawify(options, { watch: true }))
gulp.task('default', ['build'])

gulp.task('manifest', function () {
  var manifest = npawify.analyze(fs.readFileSync(path.join(__dirname, 'src/adapter.js')), pkg)
  manifest.libVersion = lib.VERSION
  if (fs.existsSync('./src/ads/')) {
    manifest.ads = []
    var files = fs.readdirSync('./src/ads/')
    for (var i = 0; i < files.length; i++) {
      var info = npawify.analyze(fs.readFileSync(path.join(__dirname, 'src/ads/' + files[i])))
      info.filename = files[i]
      manifest.ads.push(info)
    }
  }
  fs.writeFile('./manifest.json', JSON.stringify(manifest, null, '  '), { mode: '664' })
})

gulp.task('deploy', function (done) {
  var sp = path.join(__dirname, './dist/sp.min.js')
  var manifest = path.join(__dirname, './manifest.json')

  if (fs.existsSync(sp)) {
    var dir = path.join(__dirname, './deploy')
    npawify.copyfiles([sp, manifest, dir + '/last'], true, function (err) {
      if (err) done(err)
      npawify.copyfiles([sp, manifest, dir + '/' + pkg.version], true, function (err) {
        done(err)
      })
    })
  }
})
