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

  getPosition: function () {
    if (this.plugin._adapter.flags.isEnded) {
      return 'post'
    } else if (this.plugin._adapter.flags.isJoined) {
      return 'mid'
    }
    return 'pre'
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

    this.references = []
    this.references[event.LOADED] = this.loadedListener.bind(this)
    this.references[event.CONTENT_PAUSE_REQUESTED] =
      this.contentPauseRequestedListener.bind(this)
    this.references[event.STARTED] = this.startedListener.bind(this)
    this.references[event.PAUSED] = this.pausedListener.bind(this)
    this.references[event.RESUMED] = this.resumedListener.bind(this)
    this.references[event.COMPLETE] = this.completeListener.bind(this)
    this.references[event.SKIPPED] = this.skippedListener.bind(this)
    this.references[event.CLICK] = this.clickListener.bind(this)
    this.references[google.ima.AdErrorEvent.Type.AD_ERROR] =
      this.errorListener.bind(this)

    for (var key in this.references) {
      this.player.ima.addEventListener(key, this.references[key])
    }
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

    // unregister listeners
    if (this.player && this.references) {
      for (var key in this.references) {
        this.player.ima.removeEventListener(key, this.references[key])
      }
      this.references = []
    }
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
