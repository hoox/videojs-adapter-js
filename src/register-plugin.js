/* global videojs:true */

// Register the plugin in videojs plugins space.
module.exports = function(youbora) {
  if (typeof videojs !== 'undefined') {
    var registerMethod = videojs.registerPlugin ? videojs.registerPlugin : videojs.plugin
    registerMethod('youbora', function(options) {
      if (typeof this.youboraplugin === 'undefined') {
        // First call of the plugin inits the plugin.
        this.youboraplugin = new youbora.Plugin(options, new youbora.adapters.Videojs5(this))
      } else {
        // Subsequent calls set options.
        this.youboraplugin.setOptions(options)
      }
    })
  }
}