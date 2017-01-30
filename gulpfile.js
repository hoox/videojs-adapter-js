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
  var name = pkg.name
  if (name && name.indexOf('youbora-adapter-') === 0) name = name.slice(16)
  var manifest = {
    name: name,
    type: 'adapter',
    tech: 'js',
    author: pkg.author,
    version: pkg.version,
    repo: pkg.repository && pkg.repository.url ? pkg.repository.url : '',
    built: new Date().toJSON().slice(0, 10),
    features: npawify.analyze(fs.readFileSync(path.join(__dirname, 'src/adapter.js')))
  }

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

gulp.task('deployable', function (done) {
  var sp = path.join(__dirname, './dist/sp.min.js')
  var map = path.join(__dirname, './dist/sp.min.js.map')
  var manifestPath = path.join(__dirname, './manifest.json')
  var manifest = require(manifestPath)

  if (fs.existsSync(sp)) {
    var dir = path.join(__dirname, './deploy/last-build/adapters/' + manifest.name + '/last-build/')
    npawify.copyfiles([map, sp, manifestPath, dir], true, function (err) {
      if (err) done(err)
      dir = path.join(__dirname, './deploy/version/adapters/' + manifest.name + '/' + manifest.version)
      npawify.copyfiles([sp, manifestPath, dir], true, function (err) {
        done(err)
      })
    })
  } else {
    npawify.Logger.error.call(this, 'Error: call `npm run build` first.')
  }
})
