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
    this.references = []
    if (this.player.ima3) {
      // Register listeners
      this.references['ima3-started'] = this.startJoinListener.bind(this)
      this.references['ima3-paused'] = this.pausedListener.bind(this)
      this.references['ima3-resumed'] = this.resumedListener.bind(this)
      this.references['ima3-complete'] = this.adEndedListener.bind(this)
      this.references['ima3-skipped'] = this.skippedListener.bind(this)
    } else if (this.player.FreeWheelPlugin) {
      // Register listeners
      this.references['ads-ad-started'] = this.startJoinListener.bind(this)
      this.references['ads-pause'] = this.pausedListener.bind(this)
      this.references['ads-play'] = this.resumedListener.bind(this)
      this.references['ads-ad-ended'] = this.adEndedListener.bind(this)
      this.references['ads-click'] = this.clickListener.bind(this)
    }

    for (var key in this.references) {
      this.player.on(key, this.references[key])
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

    // unregister listeners
    if (this.player && this.references) {
      for (var key in this.references) {
        this.player.off(key, this.references[key])
      }
      this.references = []
    }
  }
})

module.exports = FreewheelAdsAdapter
