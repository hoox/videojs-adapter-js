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
    var currentLevel = adapter.getTech().hls_.currentLevel
    if (typeof currentLevel === "undefined" || currentLevel === -1 || !adapter.getTech().hls_.levels) {
      return null
    }
    var level = adapter.getTech().hls_.levels[currentLevel]
    if (level && level.bitrate) return level.bitrate
    return null
  },

  getRendition: function (adapter) {
    var currentLevel = adapter.getTech().hls_.currentLevel
    if (typeof currentLevel === "undefined" || currentLevel === -1 || !adapter.getTech().hls_.levels) {
      return null
    }
    var level = adapter.getTech().hls_.levels[currentLevel]
    if (level) {
      if (level.name) {
        return level.name
      } else {
        return Util.buildRenditionString(level.width, level.height, level.bitrate)
      }
    }
    return null
  }
}
