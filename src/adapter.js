/* global videojs:true */
var youbora = require('youboralib')
var manifest = require('../manifest.json')

youbora.adapters.Videojs5 = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-' + manifest.name + '-' + manifest.tech
  },

  getPlayhead: function () {
    if (this.player.ads && this.player.ads.snapshot && this.player.ads.snapshot.currentTime) {
      return this.player.ads.snapshot.currentTime
    } else if (this.player.absoluteTime) {
      return this.player.absoluteTime()
    } else {
      return this.player.currentTime()
    }
  },

  getDuration: function () {
    if (this.player.mediainfo && typeof this.player.mediainfo.duration !== 'undefined') {
      return this.player.mediainfo.duration // brightcove
    } else {
      return this.player.duration()
    }
  },

  getResource: function () {
    if (this.getTech().hls_) {
      return this.getTech().hls_.url // hlsjs
    } else {
      return this.player.currentSrc()
    }
  },

  getTitle: function () {
    if (this.player.mediainfo && this.player.mediainfo.name) {
      return this.player.mediainfo.name // brightcove
    }
  },

  getThroughput: function () {
    if (this.getTech().hls && this.getTech().hls.bandwidth) {
      return this.getTech().hls.bandwidth // hlsjs
    }
  },

  getBitrate: function () {
    if (this.getTech().hls) { // contrib hls
      var media = this.getTech().hls.playlists.media()
      if (media && media.attributes) return media.attributes.BANDWIDTH
    } else if (this.getTech().hls_) { // hlsjs
      var level = this.getTech().hls_.levels[this.getTech().hls_.currentLevel]
      if (level && level.bitrate) return level.bitrate
    }
  },

  getRendition: function () {
    if (this.getTech().hls) { // contrib hls
      var media = this.getTech().hls.playlists.media()
      if (media && media.attributes) {
        var att = media.attributes
        if (att.NAME) {
          return att.NAME
        } else if (att.RESOLUTION) {
          return youbora.Util.buildRenditionString(
            att.RESOLUTION.width,
            att.RESOLUTION.height,
            att.BANDWIDTH
          )
        } else {
          return youbora.Util.buildRenditionString(att.BANDWIDTH)
        }
      }
    } else if (this.getTech().hls_) { // hlsjs
      var level = this.getTech().hls_.levels[this.getTech().hls_.currentLevel]
      if (level && level.name) {
        return level.name
      } else {
        return youbora.Util.buildRenditionString(level.width, level.height, level.bitrate)
      }
    }
  },

  getPlayerName: function () {
    var name = 'videojs5'
    if (this.getTech().hls) name += '-hls' // hls-contrib
    if (this.getTech().hls_) name += '-hlsjs' // hlsjs
    if (this.player.mediainfo) name += '-bcove' // brightcove
    if (this.player.ima || this.player.ima3) name += '-ima' // ima3
    if (this.player.FreeWheelPlugin) name += '-fw' // freewheel
    if (this.player.onceux) this.pluginName += '-oux' // OnceUX
    return name
  },

  getPlayerVersion: function () {
    var ver = this.getPlayerName()
    if (videojs.VERSION) ver += ' ' + videojs.VERSION
    return ver
  },

  getTech: function () {
    // NOTE: Videojs discourages accessing techs from plugins because they want
    // devs to develop tech-agnostic plugins. I don't think this applies to us,
    // as we need to retrieve info from each different tech.
    // https://github.com/videojs/video.js/issues/2617
    return this.player.tech({ IWillNotUseThisInPlugins: true })
  },

  registerListeners: function () {
    // Console all events if logLevel=DEBUG
    youbora.Util.logAllEvents(this.player, [
      'adstart', 'adend', 'adskip', 'adsready', 'adserror', 'dispose'])

    // Enable playhead monitor
    this.monitorPlayhead(true, false)

    // Register listeners
    this.player.on('loadstart', this.loadstartListener.bind(this))
    this.player.on('adsready', this.adsreadyListener.bind(this))
    this.player.on('play', this.playListener.bind(this))
    this.player.on('timeupdate', this.timeupdateListener.bind(this))
    this.player.on('pause', this.pauseListener.bind(this))
    this.player.on('playing', this.playingListener.bind(this))
    this.player.on('abort', this.abortListener.bind(this))
    this.player.on('ended', this.endedListener.bind(this))
    this.player.on('dispose', this.disposeListener.bind(this))
    this.player.on('seeking', this.seekingListener.bind(this))
    this.player.on('seeked', this.seekedListener.bind(this))
    this.player.on('error', this.errorListener.bind(this))
  },

  loadstartListener: function (e) {
    youbora.Log.notice('Player detected ' + this.getPlayerName())
    if (this.player.autoplay()) this.fireStart()
  },

  adsreadyListener: function (e) {
    this.loadAdsAdapter()
  },

  playListener: function (e) {
    this.fireStart()
  },

  timeupdateListener: function (e) {
    if (this.getPlayhead() > 0.1) {
      this.fireJoin()

      // Send seek end
      if (this.lastSeekPlayhead && this.lastSeekPlayhead !== this.getPlayhead()) {
        this.fireSeekEnd()
        this.lastSeekPlayhead = false
      }
    }
  },

  pauseListener: function (e) {
    this.firePause()
  },

  playingListener: function (e) {
    this.fireResume()
  },

  abortListener: function (e) {
    this.fireStop()
  },

  endedListener: function (e) {
    this.fireStop()
  },

  disposeListener: function (e) {
    this.fireStop()
  },

  seekingListener: function (e) {
    this.fireSeekBegin()
  },

  seekedListener: function (e) {
    // We save the playhead after the seek, we will send the seeked in the next timeupdate
    this.lastSeekPlayhead = this.getPlayhead()
  },

  errorListener: function (e) {
    if (this.player.error && this.player.error()) {
      this.fireError(this.player.error().code, this.player.error().message)
    }
  },

  unregisterListeners: function () {
    // Disable playhead monitoring
    this.monitor.stop()

    // unregister listeners
    this.player.off('loadstart', this.loadstartListener)
    this.player.off('adsready', this.adsreadyListener)
    this.player.off('play', this.playListener)
    this.player.off('playing', this.playingListener)
    this.player.off('pause', this.pauseListener)
    this.player.off('abort', this.abortListener)
    this.player.off('ended', this.endedListener)
    this.player.off('dispose', this.disposeListener)
    this.player.off('seeking', this.seekingListener)
    this.player.off('seeked', this.seekedListener)
    this.player.off('timeupdate', this.timeupdateListener)
    this.player.off('error', this.errorListener)
  },

  loadAdsAdapter: function () {
    if (this.plugin.getAdsAdapter() === null) {
      var adapter
      if (typeof google !== 'undefined') {
        if (this.player.mediainfo && this.player.ads && this.player.ima3) { // Brightcove+IMA
          adapter = new youbora.adapters.Videojs5.BrightcoveAdsAdapter(this.player)
        } else if (this.player.ima) { // IMA Standalone
          adapter = new youbora.adapters.Videojs5.ImaAdsAdapter(this.player)
        }
      } else if (this.player.onceux) { // OnceUX
        adapter = new youbora.adapters.Videojs5.OnceUXAdsAdapter(this.player)
      } else { // Generic
        adapter = new youbora.adapters.Videojs5.GenericAdsAdapter(this.player)
      }

      this.plugin.setAdsAdapter(adapter)
    }
  }
},
  // Static members
  {
    GenericAdsAdapter: require('./ads/generic'),
    ImaAdsAdapter: require('./ads/ima'),
    BrightcoveAdsAdapter: require('./ads/brightcove'),
    OnceUXAdsAdapter: require('./ads/onceux')
  }
)

module.exports = youbora.adapters.Videojs5
