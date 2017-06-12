var youbora = require('youboralib')
var Videojs5Adapter = require('./base-adapter')

var BrightcoveVideojs5Adapter = Videojs5Adapter.extend({
  getDuration: function () {
    if (this.player.mediainfo && typeof this.player.mediainfo.duration !== 'undefined') {
      return this.player.mediainfo.duration // brightcove
    } else {
      Videojs5Adapter.prototype.getDuration.apply(this, arguments) // super
    }
  },

  getTitle: function () {
    return this.player.mediainfo.name // brightcove
  },

  getPlayerName: function () {
    var name = Videojs5Adapter.prototype.getPlayerName.apply(this, arguments) // super
    if (this.player.mediainfo) name += '-bcove' // brightcove
    return name
  },

  loadAdsAdapter: function () {
    if (this.plugin.getAdsAdapter() === null) {
      var adapter
      if (typeof google !== 'undefined' && this.player.ima3) { // BC + IMA
        adapter = new BrightcoveVideojs5Adapter.BrightcoveAdsAdapter(this.player)
      } else {
        adapter = Videojs5Adapter.prototype.loadAdsAdapter.apply(this, arguments) // super
      }

      this.plugin.setAdsAdapter(adapter)
    }
  }
},
  // Static members
  {
    // Brightcove ads adapter
    BrightcoveAdsAdapter: require('./ads/brightcove'),

    // Base adapter, brighcove-less
    BaseVideojs5Adapter: Videojs5Adapter
  }
)

youbora.adapters.Videojs5 = BrightcoveVideojs5Adapter

module.exports = BrightcoveVideojs5Adapter
