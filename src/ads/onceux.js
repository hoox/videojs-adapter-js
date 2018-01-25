var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var OnceUXAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-onceux-ads'
  },

  getResource: function () {
    return this.player.ads.contentSrc
  },

  getPlayhead: function () {
    return this.player.onceux.currentTime()
  },

  getDuration: function () {
    return this.player.onceux.duration()
  },

  registerListeners: function () {
    // Console all events if logLevel=DEBUG
    youbora.Util.logAllEvents(this.player, [
      null,
      'onceux-ads-complete',
      'onceux-adroll-start',
      'onceux-adroll-complete',
      'onceux-linearad-start',
      'onceux-linearad-impression',
      'onceux-linearad-complete',
      'onceux-linearad-skipped',
      'onceux-linearad-pause',
      'onceux-linearad-resume',
      'onceux-companionad-creativeView',
      'adserror',
      'ads-click'
    ])

    // Enable playhead monitor
    this.monitorPlayhead(true, false)

    // Register listeners
    this.references = []
    this.references['onceux-linearad-start'] = this.startedListener.bind(this)
    this.references['onceux-linearad-pause'] = this.pausedListener.bind(this)
    this.references['onceux-linearad-resume'] = this.resumedListener.bind(this)
    this.references['onceux-linearad-complete'] = this.completeListener.bind(this)
    this.references['onceux-linearad-skipped'] = this.skippedListener.bind(this)
    this.references['adserror'] = this.errorListener.bind(this)
    this.references['ads-click'] = this.clickListener.bind(this)

    for (var key in this.references) {
      this.player.on(key, this.references[key])
    }
  },

  startedListener: function (e) {
    this.fireStart()
    this.fireJoin()
  },

  pausedListener: function (e) {
    this.firePause()
  },

  resumedListener: function (e) {
    this.fireResume()
  },

  completeListener: function (e) {
    this.fireStop()
  },

  skippedListener: function (e) {
    this.fireStop({ skipped: true })
  },

  errorListener: function (e) {
    this.fireError("OnceUX ad error")
  },

  clickListener: function (e) {
    this.fireClick()
  },

  unregisterListeners: function () {
    // Disable playhead monitoring
    this.monitor.stop()

    // unregister listeners
    if (this.player && this.references) {
      for (var key in this.references) {
        this.player.off(key, this.references[key])
      }
      this.references = []
    }
  }
},
  // Static Members
  {
    isUsed: function (plugin) {
      return plugin.player.onceux
    }
  }
)

module.exports = OnceUXAdsAdapter
