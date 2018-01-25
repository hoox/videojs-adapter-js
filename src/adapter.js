/* global videojs:true */
var youbora = require('youboralib')
var manifest = require('../manifest.json')

var Videojs5Adapter = youbora.Adapter.extend({
  getVersion: function () {
    return manifest.version + '-' + manifest.name + '-' + manifest.tech
  },

  getPlayhead: function () {
    if (
      this.player.ads &&
      this.player.ads.state === 'ads-playback' &&
      this.player.ads.snapshot &&
      this.player.ads.snapshot.currentTime
    ) {
      return this.player.ads.snapshot.currentTime
    } else if (this.player.absoluteTime) {
      return this.player.absoluteTime()
    } else {
      return this.player.currentTime()
    }
  },

  getDuration: function () {
    return this.player.duration()
  },

  getResource: function () {
    if (Videojs5Adapter.HlsJsTech.isUsed(this)) {
      return Videojs5Adapter.HlsJsTech.getResource(this)
    } else if (Videojs5Adapter.ShakaTech.isUsed(this)) {
      return Videojs5Adapter.ShakaTech.getResource(this)
    } else {
      return this.player.currentSrc()
    }
  },

  getBitrate: function () {
    if (Videojs5Adapter.ContribHlsTech.isUsed(this)) {
      return Videojs5Adapter.ContribHlsTech.getBitrate(this)
    } else if (Videojs5Adapter.HlsJsTech.isUsed(this)) {
      return Videojs5Adapter.HlsJsTech.getBitrate(this)
    } else if (Videojs5Adapter.ShakaTech.isUsed(this)) {
      return Videojs5Adapter.ShakaTech.getBitrate(this)
    }
  },

  getRendition: function () {
    if (Videojs5Adapter.ContribHlsTech.isUsed(this)) {
      return Videojs5Adapter.ContribHlsTech.getRendition(this)
    } else if (Videojs5Adapter.HlsJsTech.isUsed(this)) {
      return Videojs5Adapter.HlsJsTech.getRendition(this)
    } else if (Videojs5Adapter.ShakaTech.isUsed(this)) {
      return Videojs5Adapter.ShakaTech.getRendition(this)
    }
  },

  getPlayerName: function () {
    var name = 'videojs5'
    if (Videojs5Adapter.ContribHlsTech.isUsed(this)) name += '-hls' // hls-contrib
    if (Videojs5Adapter.HlsJsTech.isUsed(this)) name += '-hlsjs' // hlsjs
    if (Videojs5Adapter.ShakaTech.isUsed(this)) name += '-shaka' // shaka
    if (Videojs5Adapter.ImaAdsAdapter.isUsed(this)) name += '-ima' // ima3
    if (Videojs5Adapter.OnceUXAdsAdapter.isUsed(this)) this.pluginName += '-oux' // OnceUX
    if (this.player.FreeWheelPlugin) name += '-fw' // freewheel
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
    this.references = []
    this.references['loadstart'] = this.loadstartListener.bind(this)
    this.references['adsready'] = this.adsreadyListener.bind(this)
    this.references['play'] = this.playListener.bind(this)
    this.references['timeupdate'] = this.timeupdateListener.bind(this)
    this.references['pause'] = this.pauseListener.bind(this)
    this.references['playing'] = this.playingListener.bind(this)
    this.references['abort'] = this.abortListener.bind(this)
    this.references['ended'] = this.endedListener.bind(this)
    this.references['dispose'] = this.disposeListener.bind(this)
    this.references['seeking'] = this.seekingListener.bind(this)
    this.references['seeked'] = this.seekedListener.bind(this)
    this.references['error'] = this.errorListener.bind(this)

    for (var key in this.references) {
      this.player.on(key, this.references[key])
    }
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
    this.conditionalStop(e)
  },

  endedListener: function (e) {
    this.conditionalStop(e)
  },

  disposeListener: function (e) {
    this.conditionalStop(e)
  },

  conditionalStop: function (e) {
    if (!navigator.userAgent.match(/iPhone|iPad|iPod/i)) { // !mobile or tablet ios
      this.fireStop()
    } else { // iphone
      if (!this.plugin._adsAdapter || typeof google === 'undefined') { // not using ima
        this.fireStop()
      }
    }
  },

  seekingListener: function (e) {
    this.fireSeekBegin({}, false)
  },

  seekedListener: function (e) {
    // We save the playhead after the seek, we will send the seeked in the next timeupdate
    this.lastSeekPlayhead = this.getPlayhead()
  },

  errorListener: function (e) {
    if (this.player.error && this.player.error()) {
      this.fireError(this.player.error().code, this.player.error().message)
    }
    if (Videojs5Adapter.ContribHlsTech.isUsed(this) && this.player.error().code === 2) {
      this.fireStop() // Fatal error
    }
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
  },

  loadAdsAdapter: function () {
    if (this.plugin.getAdsAdapter() === null) {
      var adapter
      if (typeof google !== 'undefined' && Videojs5Adapter.ImaAdsAdapter.isUsed(this)) {
        adapter = new Videojs5Adapter.ImaAdsAdapter(this.player) // IMA
      } else if (Videojs5Adapter.OnceUXAdsAdapter.isUsed(this)) {
        adapter = new Videojs5Adapter.OnceUXAdsAdapter(this.player) // OnceUX
      } else if (this.player.ads) {
        adapter = new Videojs5Adapter.FreewheelAdsAdapter(this.player) // Freewheel
      } else { // Generic
        adapter = new Videojs5Adapter.GenericAdsAdapter(this.player) // Generic
      }
      this.plugin.setAdsAdapter(adapter)
    }
  }
},
  // Static members
  {
    // Ads Adaptrs
    GenericAdsAdapter: require('./ads/generic'),
    FreewheelAdsAdapter: require('./ads/freewheel'),
    ImaAdsAdapter: require('./ads/ima'),
    OnceUXAdsAdapter: require('./ads/onceux'),

    // Techs
    ContribHlsTech: require('./tech/contrib-hls'),
    HlsJsTech: require('./tech/hls-js'),
    ShakaTech: require('./tech/shaka')
  }
)

youbora.adapters.Videojs5 = Videojs5Adapter

module.exports = youbora.adapters.Videojs5
