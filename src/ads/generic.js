var youbora = require('youboralib')
var manifest = require('../manifest.json')

var GenericAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-ads'
  },

  getPosition: function () {
    if (this.plugin && this.plugin.getAdapter() && this.plugin.getAdapter().flags.isJoined) {
      return 'mid'
    } else {
      return 'pre'
    }
  },

  registerListeners: function () {
    // Register listeners
    this.player.on('adstart', this.adstartListener.bind(this))
    this.player.on('adend', this.adEndListener.bind(this))
    this.player.on('adskip', this.adSkipListener.bind(this))
  },

  adStartListener: function (e) {
    this.fireStart()
    this.fireJoin()
  },

  adEndListener: function (e) {
    this.fireStop()
  },

  adSkipListener: function (e) {
    this.fireStop({ skipped: true })
  },

  unregisterListeners: function () {
    // unregister listeners
    this.player.off('adstart', this.adStartListener)
    this.player.off('adend', this.adEndListener)
    this.player.off('adskip', this.adSkipListener)
  }
})

module.exports = GenericAdsAdapter
