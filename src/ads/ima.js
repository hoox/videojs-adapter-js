/* global google:true */

var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var ImaAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-videojs-ima-ads'
  },

  getDuration: function () {
    if (this.player.ima.getAdsManager().getCurrentAd() !== null) {
      this.duration = this.player.ima.getAdsManager().getCurrentAd().getDuration()
    }
    return this.duration
  },

  // NOT AVAILABLE AT adStart
  // getResource: function () {
  //   return this.player.ima.getAdsManager().getCurrentAd().getMediaUrl()
  // },

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

    // Shortcut events
    var event = google.ima.AdEvent.Type

    // Console all events if logLevel=DEBUG
    youbora.Util.logAllEvents(this.player.ima.addEventListener, [
      null,
      event.ALL_ADS_COMPLETED,
      event.LINEAR_CHANGED,
      event.USER_CLOSE,
      event.COMPLETE,
      event.IMPRESSION,
      event.CONTENT_PAUSE_REQUESTED,
      event.CONTENT_RESUME_REQUESTED,
      event.SKIPPED,
      event.SKIPPABLE_STATE_CHANGED,
      event.LOADED,
      event.PAUSED,
      event.RESUMED,
      event.STARTED,
      event.AD_CAN_PLAY,
      event.AD_METADATA,
      event.EXPANDED_CHANGED,
      event.AD_BREAK_READY,
      event.LOG,
      event.CLICK,
      google.ima.AdErrorEvent.Type.AD_ERROR
    ])

    // Register listeners
    this.player.ima.addEventListener(event.LOADED, this.loadedListener.bind(this))
    this.player.ima.addEventListener(event.CONTENT_PAUSE_REQUESTED,
      this.contentPauseRequestedListener.bind(this))
    this.player.ima.addEventListener(event.STARTED, this.startedListener.bind(this))
    this.player.ima.addEventListener(event.PAUSED, this.pausedListener.bind(this))
    this.player.ima.addEventListener(event.RESUMED, this.resumedListener.bind(this))
    this.player.ima.addEventListener(event.COMPLETE, this.completeListener.bind(this))
    this.player.ima.addEventListener(event.SKIPPED, this.skippedListener.bind(this))
    this.player.ima.addEventListener(event.CLICK, this.clickListener.bind(this))
    this.player.ima.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,
      this.errorListener.bind(this))
    this.player.on('adend', this.adEndedListener.bind(this))
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

  adEndedListener: function (e) {
    this.fireStop()
  },

  errorListener: function (e) {
    var error = e.getError()
    this.fireError(error.getCode(), error.getMessage())
  },

  clickListener: function (e) {
    this.fireClick()
  },

  unregisterListeners: function () {
    // Disable playhead monitoring
    this.monitor.stop()

    // Remove listeners
    this.player.ima.removeEventListener(event.LOADED, this.loadedListener)
    this.player.ima.removeEventListener(event.CONTENT_PAUSE_REQUESTED,
      this.contentPauseRequestedListener)
    this.player.ima.removeEventListener(event.STARTED, this.startedListener)
    this.player.ima.removeEventListener(event.PAUSED, this.pausedListener)
    this.player.ima.removeEventListener(event.RESUMED, this.resumedListener)
    this.player.ima.removeEventListener(event.COMPLETE, this.completeListener)
    this.player.ima.removeEventListener(event.SKIPPED, this.skippedListener)
    this.player.ima.removeEventListener(event.CLICK, this.clickListener)
    this.player.ima.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,
      this.errorListener)
  }
},
  // Static Members
  {
    isUsed: function (plugin) {
      return plugin.player.ima
    }
  }
)

module.exports = ImaAdsAdapter
