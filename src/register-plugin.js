/* global videojs:true */

// Register the plugin in videojs plugins space.
module.exports = function (youbora) {
  if (typeof videojs !== 'undefined') {
    videojs.plugin('youbora', function (options) {
      if (typeof this.youboraplugin === 'undefined') {
        // First call of the plugin inits the plugin.
        this.youboraplugin = new youbora.Plugin(options, new youbora.adapters.VideoJS5(this))
      } else {
        // Subsequent calls set options.
        this.youboraplugin.setOptions(options)
      }
    })
  }
}
