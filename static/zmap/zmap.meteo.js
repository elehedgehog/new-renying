//ref http://www.thinksaas.cn/group/topic/335401/
L.Util.GPS = {
	PI: 3.14159265358979324,
	x_pi: 3.14159265358979324 * 3000.0 / 180.0,
	delta: function (lat, lon) {
		// Krasovsky 1940
		//
		// a = 6378245.0, 1/f = 298.3
		// b = a * (1 - f)
		// ee = (a^2 - b^2) / a^2;
		var a = 6378245.0;
		var ee = 0.00669342162296594323;
		var dLat = this.transformLat(lon - 105.0, lat - 35.0);
		var dLon = this.transformLon(lon - 105.0, lat - 35.0);
		var radLat = lat / 180.0 * this.PI;
		var magic = Math.sin(radLat);
		magic = 1 - ee * magic * magic;
		var sqrtMagic = Math.sqrt(magic);
		dLat = (dLat * 180.0)
			/ ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
		dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
		return {
			'lat': dLat,
			'lon': dLon
		};
	},
	// WGS-84 to GCJ-02
	wgsToGcj: function (wgsLat, wgsLon) {
		if (this.outOfChina(wgsLat, wgsLon))
			return {
				'lat': wgsLat,
				'lon': wgsLon
			};

		var d = this.delta(wgsLat, wgsLon);
		return {
			'lat': wgsLat + d.lat,
			'lon': wgsLon + d.lon
		};
	},
	// GCJ-02 to WGS-84
	gcjToWgs: function (gcjLat, gcjLon) {
		if (this.outOfChina(gcjLat, gcjLon))
			return {
				'lat': gcjLat,
				'lon': gcjLon
			};

		var d = this.delta(gcjLat, gcjLon);
		return {
			'lat': gcjLat - d.lat,
			'lon': gcjLon - d.lon
		};
	},
	// GCJ-02 to WGS-84 exactly
	gcjToWgsExact: function (gcjLat, gcjLon) {
		var initDelta = 0.01;
		var threshold = 0.000000001;
		var dLat = initDelta, dLon = initDelta;
		var mLat = gcjLat - dLat, mLon = gcjLon - dLon;
		var pLat = gcjLat + dLat, pLon = gcjLon + dLon;
		var wgsLat, wgsLon, i = 0;
		while (1) {
			wgsLat = (mLat + pLat) / 2;
			wgsLon = (mLon + pLon) / 2;
			var tmp = this.wgsToGcj(wgsLat, wgsLon)
			dLat = tmp.lat - gcjLat;
			dLon = tmp.lon - gcjLon;
			if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
				break;

			if (dLat > 0)
				pLat = wgsLat;
			else
				mLat = wgsLat;
			if (dLon > 0)
				pLon = wgsLon;
			else
				mLon = wgsLon;

			if (++i > 10000)
				break;
		}
		// console.log(i);
		return {
			'lat': wgsLat,
			'lon': wgsLon
		};
	},
	// GCJ-02 to BD-09
	gcjToBd: function (gcjLat, gcjLon) {
		var x = gcjLon, y = gcjLat;
		var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
		var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
		bdLon = z * Math.cos(theta) + 0.0065;
		bdLat = z * Math.sin(theta) + 0.006;
		return {
			'lat': bdLat,
			'lon': bdLon
		};
	},
	// BD-09 to GCJ-02
	bgToGcj: function (bdLat, bdLon) {
		var x = bdLon - 0.0065, y = bdLat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
		var gcjLon = z * Math.cos(theta);
		var gcjLat = z * Math.sin(theta);
		return {
			'lat': gcjLat,
			'lon': gcjLon
		};
	},
	distance: function (latA, logA, latB, logB) {
		var earthR = 6371000;
		var x = Math.cos(latA * Math.PI / 180) * Math.cos(latB * Math.PI / 180)
			* Math.cos((logA - logB) * Math.PI / 180);
		var y = Math.sin(latA * Math.PI / 180) * Math.sin(latB * Math.PI / 180);
		var s = x + y;
		if (s > 1)
			s = 1;
		if (s < -1)
			s = -1;
		var alpha = Math.acos(s);
		var distance = alpha * earthR;
		return distance;
	},
	outOfChina: function (lat, lon) {
		if (lon < 72.004 || lon > 137.8347)
			return true;
		if (lat < 0.8293 || lat > 55.8271)
			return true;
		return false;
	},
	transformLat: function (x, y) {
		var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2
			* Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x
			* this.PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0
			* this.PI)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y
			* this.PI / 30.0)) * 2.0 / 3.0;
		return ret;
	},
	transformLon: function (x, y) {
		var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
			* Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x
			* this.PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0
			* this.PI)) * 2.0 / 3.0;
		ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x
			/ 30.0 * this.PI)) * 2.0 / 3.0;
		return ret;
	}
};

L.Util.angle2Rad = function (angle) {
	return angle * Math.PI / 180;
};
L.Util.rad2Angle = function (rad) {
	return rad * 180 / Math.PI;
};
L.Util.lineAngle = function (latlng1, latlng2) {
	var dltLat = latlng2.lat - latlng1.lat;
	var dltLng = latlng2.lng - latlng1.lng;
	var theta = L.Util.rad2Angle(Math.atan(dltLat / dltLng));
	if (theta > 0) {
		if (latlng2.lng > latlng1.lng) { //1
			theta = theta;
		} else { //3
			theta = theta + 180;
		}
	} else if (theta < 0) {
		if (latlng2.lng > latlng1.lng) { //4
			theta = 360 + theta;
		} else { //2
			theta = 180 + theta;
		}
	} else {
		if (latlng2.lng > latlng1.lng) { //x+
			theta = 0;
		} else { //x-
			theta = 180;
		}
	}
	return 90 - theta;
};
L.Util.linePoint = function (latlng1, latlng2, posRatio) {
	var dltLat = latlng2.lat - latlng1.lat;
	var dltLng = latlng2.lng - latlng1.lng;
	var lat = latlng1.lat + dltLat * posRatio;
	var lng = latlng1.lng + dltLng * posRatio;
	return L.latLng(lat, lng);
};
L.Util.lineFromPoint = function (p1, p2) {
	var tmp = {};
	tmp.a = p2.y - p1.y;
	tmp.b = p1.x - p2.x;
	tmp.c = p2.x * p1.y - p1.x * p2.y;
	return tmp;
};
L.Util.verticalLine = function (a, b, m) {
	var l = {};
	if (a.y == b.y) {	//horizontal line
		l.a = -1;
		l.b = 0;
		l.c = m.x;
	} else if (a.x == b.x) {	//vertical line
		l.a = 0;
		l.b = -1;
		l.c = m.y;
	} else {
		// k1 * k2 = -1
		var k = (a.x - b.x) / (b.y - a.y);
		l.a = k;
		l.b = -1;
		l.c = m.y - k * m.x;
	}
	return l;
};
L.Util.collinearPoint = function (a, b, disA) {
	var line = L.Util.lineFromPoint(a, b);
	var vecAB = { x: b.x - a.x, y: b.y - a.y };
	var dis = Math.sqrt(vecAB.x * vecAB.x + vecAB.y * vecAB.y);
	var p = {
		x: (line.b * vecAB.x * a.x + line.b * vecAB.y * a.y + line.b * dis * disA + line.c * vecAB.y) / (vecAB.x * line.b - vecAB.y * line.a),
		y: -(vecAB.x * line.c + vecAB.x * a.x * line.a + vecAB.y * a.y * line.a + dis * disA * line.a) / (vecAB.x * line.b - vecAB.y * line.a)
	};
	return L.point(p.x, p.y);
};
L.Util.verticalPoints = function (a, b, m, disM) {
	var line = L.Util.lineFromPoint(a, b);
	var vecAB = { x: b.x - a.x, y: b.y - a.y };
	var dis = Math.sqrt(vecAB.x * vecAB.x + vecAB.y * vecAB.y);
	var ps = [];
	var vline = L.Util.verticalLine(a, b, m);
	ps[0] = L.point(-(vline.b * vecAB.x * m.y - vline.b * vecAB.y * m.x + vline.b * dis * disM + vline.c * vecAB.x) / (vecAB.x * vline.a + vecAB.y * vline.b),
		(vecAB.x * m.y * vline.a - vecAB.y * vline.c - vecAB.y * m.x * vline.a + dis * disM * vline.a) / (vecAB.x * vline.a + vecAB.y * vline.b));
	ps[1] = L.point(-(vline.b * vecAB.x * m.y - vline.b * vecAB.y * m.x + vline.b * dis * disM * (-1) + vline.c * vecAB.x) / (vecAB.x * vline.a + vecAB.y * vline.b),
		(vecAB.x * m.y * vline.a - vecAB.y * vline.c - vecAB.y * m.x * vline.a + dis * disM * (-1) * vline.a) / (vecAB.x * vline.a + vecAB.y * vline.b));
	return ps;
};
L.Util.roundPoint = function (p) {
	p.x = Math.round(p.x);
	p.y = Math.round(p.y);
	return p;
}

L.AngleMarker = L.Marker.extend({
	_setPos: function (pos) {
		L.DomUtil.setPosition(this._icon, pos);
		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		if (this.options.iconAngle) {
			this._icon.style.WebkitTransform = this._icon.style.WebkitTransform + ' rotate(' + this.options.iconAngle + 'deg)';
			this._icon.style.MozTransform = this._icon.style.MozTransform + 'rotate(' + this.options.iconAngle + 'deg)';
			this._icon.style.MsTransform = this._icon.style.MsTransform + 'rotate(' + this.options.iconAngle + 'deg)';
			this._icon.style.OTransform = this._icon.style.OTransform + 'rotate(' + this.options.iconAngle + 'deg)';
		}

		if (this.options.iconOrigin) {
			this._icon.style.WebkitTransformOrigin = this.options.iconOrigin;
			this._icon.style.MozTransformOrigin = this.options.iconOrigin;
			this._icon.style.MsTransformOrigin = this.options.iconOrigin;
			this._icon.style.OTransformOrigin = this.options.iconOrigin;
		}

		this._icon.style.zIndex = pos.y;

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	}
});
//options like this: {icon: L.icon(iconOption), iconAngle: angle}
L.angleMarker = function (latlng, options) {
	return new L.AngleMarker(latlng, options);
};

L.arrowMarker = function (latlng, angle) {
	var icon = { iconUrl: '/js/tool/zmap/images/marker-arrow.png', iconSize: [20, 28], iconAnchor: [10, 14] };
	return L.angleMarker(latlng, { icon: new L.Icon(icon), iconAngle: angle });
};

L.Markerline = L.Polyline.extend({
	options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0,
		noClip: false,
		markerIcon: L.icon({ iconUrl: '/js/tool/zmap/images/marker-arrow.png', iconSize: [20, 28], iconAnchor: [10, 14] }),
		markerPos: 0.5,
	},

	initialize: function (latlngs, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlngs = this._convertLatLngs(latlngs);

		this.icons = [];
		var size = this._latlngs.length;
		for (var i = 0; i < size - 1; i++) {
			var latlng1 = this._latlngs[i];
			var latlng2 = this._latlngs[i + 1];
			var latlng = L.Util.linePoint(latlng1, latlng2, this.options.markerPos);
			var angle = L.Util.lineAngle(latlng1, latlng2);
			var arrow = L.angleMarker(latlng, { icon: this.options.markerIcon, iconAngle: angle });
			this.icons.push(arrow);
		}
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initElements();
			this._initEvents();
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
			for (var i = 0; i < this.icons.length; i++)
				this._map.addLayer(this.icons[i]);
		}

		this.fire('add');

		map.on({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	addTo: function (map) {
		map.addLayer(this);
		for (var i = 0; i < this.icons.length; i++)
			this._map.addLayer(this.icons[i]);
		return this;
	},

	onRemove: function (map) {
		map._pathRoot.removeChild(this._container);
		for (var i = 0; i < this.icons.length; i++)
			this._map.removeLayer(this.icons[i]);
		delete this.icons;

		// Need to fire remove event before we set _map to null as the event hooks might need the object
		this.fire('remove');
		this._map = null;

		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}

		map.off({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},
});
L.markerline = function (latlngs, options) {
	return new L.Markerline(latlngs, options);
};

// L.Draw.Markerline = L.Draw.Polyline.extend({
// 	//special option attribute: markerIcon, markerPos
// 	options: {
// 		allowIntersection: true,
// 		repeatMode: false,
// 		drawError: {
// 			color: '#b00b00',
// 			timeout: 2500
// 		},
// 		icon: new L.DivIcon({
// 			iconSize: new L.Point(8, 8),
// 			className: 'leaflet-div-icon leaflet-editing-icon'
// 		}),
// 		markerIcon: L.icon({ iconUrl: '/js/tool/zmap/images/marker-arrow.png', iconSize: [20, 28], iconAnchor: [10, 14] }),
// 		markerPos: 0.5,
// 		guidelineDistance: 20,
// 		maxGuideLineLength: 4000,
// 		shapeOptions: {
// 			stroke: true,
// 			color: '#f06eaa',
// 			weight: 4,
// 			opacity: 0.5,
// 			fill: false,
// 			clickable: true
// 		},
// 		metric: true, // Whether to use the metric meaurement system or imperial
// 		showLength: true, // Whether to display distance in the tooltip
// 		zIndexOffset: 2000 // This should be > than the highest z-index any map layers
// 	},

// 	addVertex: function (latlng) {
// 		var markersLength = this._markers.length;
// 		if (markersLength > 0) {
// 			var latlng0 = this._markers[markersLength - 1].getLatLng();
// 			var angle = L.Util.lineAngle(latlng0, latlng);
// 			var arrowLatlng = L.Util.linePoint(latlng0, latlng, this.options.markerPos);
// 			var arrow = L.angleMarker(arrowLatlng, { icon: this.options.markerIcon, iconAngle: angle });
// 			this._markerGroup.addLayer(arrow);
// 			if (!this._icons) this._icons = [];
// 			this._icons.push(arrow);
// 		}

// 		if (markersLength > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
// 			this._showErrorTooltip();
// 			return;
// 		}
// 		else if (this._errorShown) {
// 			this._hideErrorTooltip();
// 		}

// 		this._markers.push(this._createMarker(latlng));

// 		this._poly.addLatLng(latlng);

// 		if (this._poly.getLatLngs().length === 2) {
// 			this._map.addLayer(this._poly);
// 		}

// 		this._vertexChanged(latlng, true);
// 	},

// 	_fireCreatedEvent: function () {
// 		this.type = "markerline";
// 		var markerline = L.markerline(this._poly.getLatLngs(), this.options);
// 		L.Draw.Feature.prototype._fireCreatedEvent.call(this, markerline);
// 		//var poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
// 		//poly.icons = [];
// 		//for (var i=0; i<this._icons.length; i++){
// 		//	var ic = this._icons[i];
// 		//	var arrow = L.angleMarker(ic.getLatLng(), {icon: this.options.markerIcon, iconAngle: ic.options.iconAngle});
// 		//	poly.icons.push(arrow);
// 		//}
// 		//L.Draw.Feature.prototype._fireCreatedEvent.call(this, poly);
// 	}
// });
// L.Draw.markerline = function (map, options) {
// 	return new L.Draw.Markerline(map, options);
// };

L.BusinessOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		zIndex: 300,
		opacity: 1
	},

	initialize: function (url, options) { // (String, LatLngBounds, Object)
		this._url = url;

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		this._map._panes.overlayPane.appendChild(this._image);
		this._reset();
	},

	onRemove: function (map) {
		map._panes.overlayPane.removeChild(this._image);
		
		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._image) {
			this._map._panes.overlayPane.appendChild(this._image);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._image) {
			pane.insertBefore(this._image, pane.firstChild);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this._image.src = this._url;
	},

	//FIXME not perfect
	setUrlAutoFit: function (url) {
		//clear _oldImage while _image is not complete
		if (this._oldImage && this._image != this._oldImage) {
			this._map._panes.overlayPane.removeChild(this._oldImage);
		}
		//record layer's _oldImage
		this._oldImage = this._image;
		this._url = url;
		this._bounds = this._map.getBounds();
		//create new image
		// var newImage = L.DomUtil.create('img', 'leaflet-image-layer' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));
		var newImage = L.DomUtil.create('img', 'leaflet-image-layer');
		if(this._zoomAnimated)
			L.DomUtil.addClass(newImage, 'leaflet-zoom-animated');

		
		newImage .onselectstart = L.Util.falseFn;
		newImage .onmousemove = L.Util.falseFn;

		// @event load: Event
		// Fired when the ImageOverlay layer has loaded its image
		newImage .onload = L.bind(this._onImageLoad, this, 'load');
		newImage .onerror = L.bind(this._overlayOnError, this, 'error');
		newImage .src = this._url;
		newImage .alt = this.options.alt;
		this._map._panes.overlayPane.appendChild(newImage);
		//set new image position
		var bounds = new L.Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		L.DomUtil.setPosition(newImage, bounds.min);

		newImage.style.width  = size.x + 'px';
		newImage.style.height = size.y + 'px';
		newImage.style.visibility = 'hidden';
		newImage.style.zIndex = this.options.zIndex;
		//set newImage as layer's _image
		this._image = newImage;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	_initImage: function () {
		// var img = this._image = L.DomUtil.create('img', 'leaflet-image-layer' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));
		var img = this._image = L.DomUtil.create('img', 'leaflet-image-layer');
		if(this._zoomAnimated)
			L.DomUtil.addClass(img, 'leaflet-zoom-animated');

		
		img.onselectstart = L.Util.falseFn;
		img.onmousemove = L.Util.falseFn;

		// @event load: Event
		// Fired when the ImageOverlay layer has loaded its image
		img.onload = L.bind(this._onImageLoad, this, 'load');
		img.onerror = L.bind(this._overlayOnError, this, 'error');

		if (this.options.crossOrigin) {
			img.crossOrigin = '';
		}

		if (this.options.zIndex) {
			this._updateZIndex();
		}

		img.src = this._url;
		img.alt = this.options.alt;
		this._bounds = this._map.getBounds();
	},

	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

		L.DomUtil.setTransform(this._image, offset, scale);
	},

	_reset: function () {
		var image = this._image,
		    bounds = new L.Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		L.DomUtil.setPosition(image, bounds.min);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_onImageLoad: function () {
		this.fire('load');
		//FIXME if it works?
		//if _image is complete, _oldImage will be removed
		if (this._oldImage && this._image != this._oldImage) {
			this._map._panes.overlayPane.removeChild(this._oldImage);
			this._oldImage = null;
			this._image.style.visibility = 'visible';
		}
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	},
	
	_updateZIndex: function () {
		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
			this._image.style.zIndex = this.options.zIndex;
		}
	},

	_layerAdd: function (e) {
		var map = e.target;

		// check in case layer gets added and then removed before the map is ready
		if (!map.hasLayer(this)) { return; }

		this._map = map;
		this._zoomAnimated = map._zoomAnimated;

		if (this.getEvents) {
			var events = this.getEvents();
			map.on(events, this);
			this.once('remove', function () {
				map.off(events, this);
			}, this);
		}

		this.onAdd(map);

		if (this.getAttribution && map.attributionControl) {
			map.attributionControl.addAttribution(this.getAttribution());
		}

		this.fire('add');
		map.fire('layeradd', {layer: this});
	},
	
	_overlayOnError: function () {
		// @event error: Event
		// Fired when the ImageOverlay layer has loaded its image
		this.fire('error');

		var errorUrl = this.options.errorOverlayUrl;
		if (errorUrl && this._url !== errorUrl) {
			this._url = errorUrl;
			this._image.src = errorUrl;
		}
	}
});

L.businessOverlay = function (url, bounds, options) {
	return new L.BusinessOverlay(url, bounds, options);
};


// L.Polyline.Measure = L.Draw.Polyline.extend({
// 	addHooks: function () {
// 		L.Draw.Polyline.prototype.addHooks.call(this);
// 		if (this._map) {
// 			this._markerGroup = new L.LayerGroup();
// 			this._map.addLayer(this._markerGroup);

// 			this._markers = [];
// 			this._startShape();
// 		}
// 	},

// 	removeHooks: function () {
// 		L.Draw.Polyline.prototype.removeHooks.call(this);

// 		this._clearHideErrorTimeout();

// 		//!\ Still useful when control is disabled before any drawing (refactor needed?)
// 		this._map.off('mousemove', this._onMouseMove);
// 		this._clearGuides();
// 		this._container.style.cursor = '';

// 		this._removeShape();
// 	},

// 	start: function () {
// 		this._removeShape();
// 		this._startShape();
// 	},

// 	stop: function () {
// 		this._removeShape();
// 	},

// 	_startShape: function () {
// 		this._drawing = true;
// 		this._poly = new L.Polyline([], this.options.shapeOptions);

// 		this._container.style.cursor = 'crosshair';

// 		this._updateTooltip();
// 		this._map.on('mousemove', this._onMouseMove, this);
// 	},

// 	_finishShape: function () {
// 		this._drawing = false;

// 		this._cleanUpShape();
// 		this._clearGuides();

// 		this._updateTooltip();

// 		this._map.off('mousemove', this._onMouseMove, this);
// 		this._container.style.cursor = '';
// 		this._map.removeLayer(this._mouseMarker);
// 	},

// 	_removeShape: function () {
// 		if (!this._poly)
// 			return;
// 		this._map.removeLayer(this._poly);
// 		delete this._poly;
// 		this._markers.splice(0);
// 		this._markerGroup.clearLayers();
// 	},

// 	_updateGuide: function (newPos) {
// 		var markerCount = this._markers.length;

// 		if (markerCount > 0) {
// 			newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);

// 			// draw the guide line
// 			this._clearGuides();
// 			this._drawGuide(
// 				this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
// 				newPos
// 			);

// 			//update tooltip text
// 			if (!this._drawing) {
// 				var e = this._markers.length;
// 				this._tooltip.updatePosition(this._markers[e - 1].getLatLng());
// 			}
// 		}
// 	},
// 	_getTooltipText: function () {
// 		var labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);
// 		if (!this._drawing) {
// 			labelText.text = '';
// 		}
// 		return labelText;
// 	}
// });

// L.Draw.ArrowLine = L.Draw.Polyline.extend({
// 	addVertex: function (latlng) {
// 		var markersLength = this._markers.length;

// 		if (markersLength > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
// 			this._showErrorTooltip();
// 			return;
// 		}
// 		else if (this._errorShown) {
// 			this._hideErrorTooltip();
// 		}

// 		this._markers.push(this._createMarker(latlng));

// 		this._poly.addLatLng(latlng);

// 		if (this._poly.getLatLngs().length === 2) {
// 			this._map.addLayer(this._poly);
// 		}

// 		this._vertexChanged(latlng, true);

// 		if (this._markers.length >= 2)
// 			this._finishShape();
// 	},

// 	_fireCreatedEvent: function () {
// 		var latlngs = this._poly.getLatLngs();
// 		if (latlngs.length != 2) return;
// 		var s = latlngs[0];
// 		var e = latlngs[1];
// 		var pa = this._map.latLngToLayerPoint(e);
// 		var pb = this._map.latLngToLayerPoint(s);
// 		var pc = L.Util.collinearPoint(pa, pb, 10);
// 		var pns1 = L.Util.verticalPoints(pa, pb, pc, 3);
// 		var pns2 = L.Util.verticalPoints(pa, pb, pc, 7);
// 		var platlngs = [];
// 		platlngs.push(this._map.layerPointToLatLng(pa));
// 		platlngs.push(this._map.layerPointToLatLng(pns2[0]));
// 		platlngs.push(this._map.layerPointToLatLng(pns1[0]));
// 		platlngs.push(this._map.layerPointToLatLng(pb));
// 		platlngs.push(this._map.layerPointToLatLng(pns1[1]));
// 		platlngs.push(this._map.layerPointToLatLng(pns2[1]));
// 		platlngs.push(this._map.layerPointToLatLng(pa));
// 		//TODO
// 		var poly = new this.Poly(platlngs, this.options.shapeOptions);
// 		L.Draw.Feature.prototype._fireCreatedEvent.call(this, poly);
// 	}
// });
// L.Draw.arrowLine = function (map, options) {
// 	return new L.Draw.ArrowLine(map, options);
// };
L.BoxZoom = L.Handler.extend({
	addHooks: function () {
		this._map.on('mousedown', this._setStateOn, this);
		this._map.on('boxzoomend', this._setStateOff, this);
	},

	removeHooks: function () {
		this._map.off('mousedown', this._setStateOn, this);
	},

	_setStateOn: function (event) {
		this._map.dragging.disable();
		this._map.boxZoom.addHooks();
		this._map.boxZoom._onMouseDown.call(this._map.boxZoom, { clientX: event.originalEvent.clientX, clientY: event.originalEvent.clientY, which: 1, shiftKey: true });
	},

	_setStateOff: function () {
		this.active = false;
		this._map.dragging.enable();
		this._map.boxZoom.removeHooks();
	}
});

L.boxzoom = function (map) {
	return new L.BoxZoom(map);
};




