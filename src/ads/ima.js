/* global google:true */

var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var BrightcoveAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-ima-ads'
  },

  getDuration: function () {
    if (this.player.ima.getAdsManager().getCurrentAd() !== null) {
      this.duration = this.player.ima.getAdsManager().getCurrentAd().getDuration()
    }
    return this.duration
  },

  getTitle: function () {
    return this.player.ima.getAdsManager().getCurrentAd().getTitle()
  },

  getPlayhead: function () {
    return this.getDuration() - this.player.ima.getAdsManager().getRemainingTime()
  },

  getPlayerVersion: function () {
    return 'IMA' + google.ima.VERSION + '; contrib-ads ' + this.player.ads.VERSION
  },

  registerListeners: function () {
    // Enable playhead monitor
    this.monitorPlayhead(true, false)

    // Console all events if logLevel=DEBUG
    youbora.Util.logAllEvents(this.player.ima.addEventListener, [
      null,
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      google.ima.AdEvent.Type.LINEAR_CHANGED,
      google.ima.AdEvent.Type.USER_CLOSE,
      google.ima.AdEvent.Type.COMPLETE,
      google.ima.AdEvent.Type.IMPRESSION,
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      google.ima.AdEvent.Type.SKIPPED,
      google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
      google.ima.AdEvent.Type.LOADED,
      google.ima.AdEvent.Type.PAUSED,
      google.ima.AdEvent.Type.RESUMED,
      google.ima.AdEvent.Type.STARTED,
      google.ima.AdEvent.Type.AD_CAN_PLAY,
      google.ima.AdEvent.Type.AD_METADATA,
      google.ima.AdEvent.Type.EXPANDED_CHANGED,
      google.ima.AdEvent.Type.AD_BREAK_READY,
      google.ima.AdEvent.Type.LOG
    ])

    // Register listeners
    this.player.ima.addEventListener(google.ima.AdEvent.Type.LOADED, this.loadedListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.contentPauseRequestedListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdEvent.Type.STARTED, this.startedListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdEvent.Type.PAUSED, this.pausedListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdEvent.Type.RESUMED, this.resumedListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdEvent.Type.COMPLETE, this.completeListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdEvent.Type.SKIPPED, this.skippedListener.bind(this))
  },

  loadedListener: function (e) {
    this.fireStart()
  },

  contentPauseRequestedListener: function (e) {
    this.fireStart()
  },

  startedListener: function (e) {
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
  }
})

module.exports = BrightcoveAdsAdapter
