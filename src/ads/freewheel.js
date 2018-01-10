var youbora = require('youboralib')
var manifest = require('../../manifest.json')

var FreewheelAdsAdapter = youbora.Adapter.extend({
  getVersion: function () {
    if (this.player.FreeWheelPlugin.version && google && google.ima) {
      return "bcove-ima " + this.player.FreeWheelPlugin.version + " / IMA" + google.ima.VERSION
    } else if (this.player.FreeWheelPlugin.getVersion) {
      return "bcove-fw " + this.player.FreeWheelPlugin.getVersion()
    } else if (this.player.FreeWheelPlugin.VERSION) {
      return "bcove-ssai " + this.player.FreeWheelPlugin.VERSION
    } else {
      return "UNKNOWN"
    }
  },

  getDuration: function () {
    var player = this.plugin.player
    if (this.player.FreeWheelPlugin.adPlayer) {
      player = this.player.FreeWheelPlugin.adPlayer
    }
    return player.duration()
  },

  getPosition: function () {
    if (this.player.FreeWheelPlugin.adsManager && this.player.FreeWheelPlugin.adsManager.getCurrentAd()) {
      var index = this.player.FreeWheelPlugin.adsManager.getCurrentAd().getAdPodInfo().getPodIndex()
      if (index === 0) {
        return 'pre'
      } else if (index === -1) {
        return 'post'
      } else if (index > 0) {
        return 'mid'
      } else {
        return 'unknown'
      }
    } else {
      if (!this.flags.isJoined) {
        return 'pre'
      } else if (this.plugin._adapter.getPlayhead() >= this.plugin._adapter.getDuration()) {
        return 'post'
      } else {
        return 'mid'
      }
    }
  },

  getTitle: function () {
    if (this.player.FreeWheelPlugin.adsManager && this.player.FreeWheelPlugin.adsManager.getCurrentAd()) {
      return this.player.FreeWheelPlugin.adsManager.getCurrentAd().getTitle()
    }
    return null
  },

  getPlayhead: function () {
    var player = this.plugin.player
    if (this.player.FreeWheelPlugin.adPlayer) {
      player = this.player.FreeWheelPlugin.adPlayer
    }
    return player.currentTime()
  },

  registerListeners: function () {
    // Enable playhead monitor
    this.monitorPlayhead(true, false)

    /*youbora.Util.logAllEvents(this.player.on, [
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
    ])*/
    if (this.player.ima3) {
      // Register listeners
      this.player.on('ima3-started', this.startJoinListener.bind(this))
      this.player.on('ima3-paused', this.pausedListener.bind(this))
      this.player.on('ima3-resumed', this.resumedListener.bind(this))
      this.player.on('ima3-complete', this.adEndedListener.bind(this))
      this.player.on('ima3-skipped', this.skippedListener.bind(this))
    } else if (this.player.FreeWheelPlugin) {
      // Register listeners
      this.player.on('ads-ad-started', this.startJoinListener.bind(this))
      this.player.on('ads-pause', this.pausedListener.bind(this))
      this.player.on('ads-play', this.resumedListener.bind(this))
      this.player.on('ads-ad-ended', this.adEndedListener.bind(this))
      this.player.on('ads-click', this.clickListener.bind(this))
    }
  },

  startJoinListener: function (e) {
    this.fireStart()
    this.fireJoin()
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
    if (this.player.ima3) {
      // Register listeners
      this.player.off('ima3-started', this.startJoinListener)
      this.player.off('ima3-paused', this.pausedListener)
      this.player.off('ima3-resumed', this.resumedListener)
      this.player.off('ima3-complete', this.adEndedListener)
      this.player.off('ima3-skipped', this.skippedListener)
    } else if (this.player.FreeWheelPlugin) {
      // Register listeners
      this.player.off('ads-ad-started', this.startedListener)
      this.player.off('ads-pause', this.pausedListener)
      this.player.off('ads-play', this.resumedListener)
      this.player.off('ads-ad-ended', this.adEndedListener)
      this.player.off('ads-click', this.clickListener)
    }
  }
})

module.exports = FreewheelAdsAdapter
