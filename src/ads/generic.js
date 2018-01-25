var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var GenericAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-ads'
  },

  registerListeners: function () {
    // Register listeners
    this.references = []
    this.references['adstart'] = this.adStartListener.bind(this)
    this.references['adend'] = this.adEndListener.bind(this)
    this.references['adskip'] = this.adSkipListener.bind(this)
    this.references['adserror'] = this.errorListener.bind(this)
    this.references['ads-click'] = this.clickListener.bind(this)

    for (var key in this.references) {
      this.player.on(key, this.references[key])
    }
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
    if (this.player && this.references) {
      for (var key in this.references) {
        this.player.off(key, this.references[key])
      }
      this.references = []
    }
  }
})

module.exports = GenericAdsAdapter
