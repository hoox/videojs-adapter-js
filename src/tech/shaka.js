var youboralib = require('youboralib')
var Util = youboralib.Util

module.exports = {
  isUsed: function (adapter) {
    return !!adapter.getTech().shakaPlayer
  },

  getResource: function (adapter) {
    return adapter.getTech().shakaPlayer.getManifestUri()
  },

  getBitrate: function (adapter) {
    return adapter.getTech().shakaPlayer.getStats().streamBandwidth
  },

  getRendition: function (adapter) {
    var tracks = adapter.getTech().shakaPlayer.getVariantTracks()
    for (var i in tracks) {
      var track = tracks[i]
      if (track.active && track.type === 'video') {
        return Util.buildRenditionString(track.width, track.height, track.bandwidth)
      }
    }
    return adapter.getTech().shakaPlayer.getStats().estimatedBandwidth
  }
}
