var youboralib = require('youboralib')
var Util = youboralib.Util

module.exports = {
  isUsed: function (adapter) {
    return !!adapter.getTech().hls
  },

  getBitrate: function (adapter) {
    var media = adapter.getTech().hls.playlists.media()
    if (media && media.attributes) return media.attributes.BANDWIDTH
  },

  getRendition: function (adapter) {
    var media = adapter.getTech().hls.playlists.media()
    if (media && media.attributes) {
      var att = media.attributes
      if (att.NAME) {
        return att.NAME
      } else if (att.RESOLUTION) {
        return Util.buildRenditionString(
          att.RESOLUTION.width,
          att.RESOLUTION.height,
          att.BANDWIDTH
        )
      } else {
        return Util.buildRenditionString(att.BANDWIDTH)
      }
    }
  }
}
