var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var BrightcoveAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-bcove-ads'
  },

  getPlayhead: function () {
    return this.player.ima3.adPlayer.currentTime()
  },

  registerListeners: function () {
    // Prints all events if debug is enabled
    youbora.Util.listenAllEvents(this.player, [
      null,
      'ima3-ready',
      'ima3error',
      'ima3-ad-error',
      'ima3-started',
      'ima3-complete',
      'ima3-paused',
      'ima3-resumed',
      'ads-request',
      'ads-load',
      'ads-ad-started',
      'ads-ad-ended',
      'ads-pause',
      'ads-play',
      'ads-click',
      'ads-pod-started',
      'ads-pod-ended',
      'ads-allpods-completed'
    ])

    // Enable playhead monitor
    this.monitorPlayhead(true, false)

    // Register listeners
    this.player.on('ima3-started', this.imaStartedListener.bind(this))
    this.player.on('ima3-paused', this.imaPausedListener.bind(this))
    this.player.on('ima3-resumed', this.imaResumedListener.bind(this))
    this.player.on('ima3-complete', this.imaCompleteListener.bind(this))
    this.player.on('ima3-skipped', this.imaSkippedListener.bind(this))
  },

  imaStartedListener: function (e) {
    this.fireStart()
    this.fireJoin()
  },

  imaPausedListener: function (e) {
    this.firePause()
  },

  imaResumedListener: function (e) {
    this.fireResume()
  },

  imaCompleteListener: function (e) {
    this.fireStop()
  },

  imaSkippedListener: function (e) {
    this.fireStop({ skipped: true })
  },

  unregisterListeners: function () {
    // Disable playhead monitoring
    this.monitor.stop()

    // unregister listeners
    this.player.off('ima3-started', this.imaStartedListener)
    this.player.off('ima3-paused', this.imaPausedListener)
    this.player.off('ima3-resumed', this.imaResumedListener)
    this.player.off('ima3-complete', this.imaCompleteListener)
    this.player.off('ima3-skipped', this.imaSkippedListener)
  }
})

module.exports = BrightcoveAdsAdapter
