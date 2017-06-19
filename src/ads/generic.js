var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var GenericAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-ads'
  },

  registerListeners: function () {
    // Register listeners
    this.player.on('adstart', this.adStartListener.bind(this))
    this.player.on('adend', this.adEndListener.bind(this))
    this.player.on('adskip', this.adSkipListener.bind(this))
    this.player.on('adserror', this.errorListener.bind(this))
    this.player.on('ads-click', this.clickListener.bind(this))
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

  errorListener: function (e) {
    this.fireError('Ad error')
  },

  clickListener: function (e) {
    this.fireClick()
  },

  unregisterListeners: function () {
    // unregister listeners
    this.player.off('adstart', this.adStartListener)
    this.player.off('adend', this.adEndListener)
    this.player.off('adskip', this.adSkipListener)
    this.player.off('adserror', this.errorListener)
    this.player.off('ads-click', this.clickListener)
  }
})

module.exports = GenericAdsAdapter
