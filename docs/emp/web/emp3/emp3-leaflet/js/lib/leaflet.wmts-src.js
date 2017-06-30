L.TileLayer.WMTS = L.TileLayer.extend({

  defaultWmtsParams: {
    service: 'WMTS',
    request: 'GetTile',
    version: '1.0.0',
    layer: '',
    style: '',
    tilematrixSet: '',
    format: 'image/jpeg'
  },

  initialize: function(url, options) { // (String, Object)
    this._url = url;
    var wmtsParams = L.extend({}, this.defaultWmtsParams),
      tileSize = options.tileSize || this.options.tileSize;
    if (options.detectRetina && L.Browser.retina) {
      wmtsParams.width = wmtsParams.height = tileSize * 2;
    } else {
      wmtsParams.width = wmtsParams.height = tileSize;
    }
    for (var i in options) {
      // all keys that are not TileLayer options go to WMTS params
      if (!this.options.hasOwnProperty(i) && i != "matrixIds") {
        wmtsParams[i] = options[i];
      }
    }
    this.wmtsParams = wmtsParams;
    this.matrixIds = options.matrixIds || this.getDefaultMatrix();
    L.setOptions(this, options);
  },

  onAdd: function(map) {
    if (this.options.leafletObject) {
      this.options.leafletObject._map = this._map;
      if (this.getEvents) {
        var events = this.getEvents();
        map.on(events, this.options.leafletObject);
        this.once('remove', function() {
          map.off(events, this);
        }, this);
      }
      this.options.leafletObject._zoomAnimated = this._zoomAnimated;
      this.options.leafletObject._eventParents = this._eventParents;
      this.options.leafletObject._layers = this._layers;
      this.options.leafletObject._mapToAdd = this._mapToAdd;
      L.TileLayer.prototype.onAdd.call(this.options.leafletObject, map);
    } else {
      L.TileLayer.prototype.onAdd.call(this, map);
    }
  },

  getTileUrl: function(tilePoint, zoom) { // (Point, Number) -> String
    var map = this._map;
    crs = map.options.crs;
    tileSize = this.options.tileSize;
    nwPoint = tilePoint.multiplyBy(tileSize);
    //+/-1 in order to be on the tile
    nwPoint.x += 1;
    nwPoint.y -= 1;
    sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
    nw = crs.project(map.unproject(nwPoint, zoom));
    se = crs.project(map.unproject(sePoint, zoom));
    tilewidth = se.x - nw.x;
    zoom = map.getZoom();
    ident = this.matrixIds[zoom].identifier;
    X0 = this.matrixIds[zoom].topLeftCorner.lng;
    Y0 = this.matrixIds[zoom].topLeftCorner.lat;
    tilecol = Math.floor((nw.x - X0) / tilewidth);
    tilerow = -Math.floor((nw.y - Y0) / tilewidth);
    // hack to fix bad tile location on north pole area
    tilerow = (Math.abs(tilerow) < 0.001)?0:tilerow;
    url = L.Util.template(this._url, {
      s: this._getSubdomain(tilePoint)
    });
    if (this.options.useProxy) {
         url  = emp.util.config.getProxyUrl() + "?" + "mime=image/*&url=" + encodeURIComponent(url);
     }
    return url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol;
  },

  setParams: function(params, noRedraw) {
    L.extend(this.wmtsParams, params);
    if (!noRedraw) {
      this.redraw();
    }
    return this;
  },

  getDefaultMatrix: function() {
    /**
     * the matrix3857 represents the projection
     * for in the IGN WMTS for the google coordinates.
     */
    var matrixIds3857 = new Array(22);
    for (var i = 0; i < 22; i++) {
      matrixIds3857[i] = {
        identifier: "" + i,
        topLeftCorner: new L.LatLng(20037508.3428, -20037508.3428)
      };
    }
    return matrixIds3857;
  }
});

L.tileLayer.wmts = function(url, options) {
  return new L.TileLayer.WMTS(url, options);
};
