var youboralib = require('youboralib')
var Util = youboralib.Util

module.exports = {
  isUsed: function (adapter) {
    return !!adapter.getTech().hls_
  },

  getResource: function (adapter) {
    return adapter.getTech().hls_.url
  },

  getBitrate: function (adapter) {
    var level = adapter.getTech().hls_.levels[adapter.getTech().hls_.currentLevel]
    if (level && level.bitrate) return level.bitrate
  },

  getRendition: function (adapter) {
    var level = adapter.getTech().hls_.levels[adapter.getTech().hls_.currentLevel]
    if (level) {
      if (level.name) {
        return level.name
      } else {
        return Util.buildRenditionString(level.width, level.height, level.bitrate)
      }
    }
  }
}
