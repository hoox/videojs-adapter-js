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
      'onceux-companionad-creativeView'
    ])

    // Enable playhead monitor
    this.monitorPlayhead(true, false)

    // Register listeners
    this.player.on('onceux-linearad-start', this.startedListener.bind(this))
    this.player.on('onceux-linearad-pause', this.pausedListener.bind(this))
    this.player.on('onceux-linearad-resume', this.resumedListener.bind(this))
    this.player.on('onceux-linearad-complete', this.completeListener.bind(this))
    this.player.on('onceux-linearad-skipped', this.skippedListener.bind(this))
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

  unregisterListeners: function () {
    // Disable playhead monitoring
    this.monitor.stop()

    // unregister listeners
    this.player.off('onceux-linearad-start', this.startedListener)
    this.player.off('onceux-linearad-pause', this.pausedListener)
    this.player.off('onceux-linearad-resume', this.resumedListener)
    this.player.off('onceux-linearad-complete', this.completeListener)
    this.player.off('onceux-linearad-skipped', this.skippedListener)
  }
})

module.exports = OnceUXAdsAdapter
