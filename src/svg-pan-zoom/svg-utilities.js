import { isElement, throttle, mouseAndTouchNormalize } from "./utilities";
var _browser = "unknown";

// http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opersa-browser
if (/*@cc_on!@*/ false || !!document.documentMode) {
	// internet explorer
	_browser = "ie";
}

export const svgNS = "http://www.w3.org/2000/svg";
export const xmlNS = "http://www.w3.org/XML/1998/namespace";
export const xmlnsNS = "http://www.w3.org/2000/xmlns/";
export const xlinkNS = "http://www.w3.org/1999/xlink";
export const evNS = "http://www.w3.org/2001/xml-events";
export function getBoundingClientRectNormalized(svg) {
	if (svg.clientWidth && svg.clientHeight) {
		return { width: svg.clientWidth, height: svg.clientHeight };
	} else if (!!svg.getBoundingClientRect()) {
		return svg.getBoundingClientRect();
	} else {
		throw new Error("Cannot get BoundingClientRect for SVG.");
	}
}
export function getOrCreateViewport(svg, selector) {
	var viewport = null;

	if (isElement(selector)) {
		viewport = selector;
	} else {
		viewport = svg.querySelector(selector);
	}

	// Check if there is just one main group in SVG
	if (!viewport) {
		var childNodes = Array.prototype.slice
			.call(svg.childNodes || svg.children)
			.filter(function (el) {
				return el.nodeName !== "defs" && el.nodeName !== "#text";
			});

		// Node name should be SVGGElement and should have no transform attribute
		// Groups with transform are not used as viewport because it involves parsing of all transform possibilities
		if (
			childNodes.length === 1 &&
			childNodes[0].nodeName === "g" &&
			childNodes[0].getAttribute("transform") === null
		) {
			viewport = childNodes[0];
		}
	}

	// If no favorable group element exists then create one
	if (!viewport) {
		var viewportId = "viewport-" + new Date().toISOString().replace(/\D/g, "");
		viewport = document.createElementNS(svgNS, "g");
		viewport.setAttribute("id", viewportId);

		// Internet Explorer (all versions?) can't use childNodes, but other browsers prefer (require?) using childNodes
		var svgChildren = svg.childNodes || svg.children;
		if (!!svgChildren && svgChildren.length > 0) {
			for (var i = svgChildren.length; i > 0; i--) {
				// Move everything into viewport except defs
				if (svgChildren[svgChildren.length - i].nodeName !== "defs") {
					viewport.appendChild(svgChildren[svgChildren.length - i]);
				}
			}
		}
		svg.appendChild(viewport);
	}

	// Parse class names
	var classNames = [];
	if (viewport.getAttribute("class")) {
		classNames = viewport.getAttribute("class").split(" ");
	}

	// Set class (if not set already)
	if (!~classNames.indexOf("svg-pan-zoom_viewport")) {
		classNames.push("svg-pan-zoom_viewport");
		viewport.setAttribute("class", classNames.join(" "));
	}

	return viewport;
}
export function setupSvgAttributes(svg) {
	// Setting default attributes
	svg.setAttribute("xmlns", svgNS);
	svg.setAttributeNS(xmlnsNS, "xmlns:xlink", xlinkNS);
	svg.setAttributeNS(xmlnsNS, "xmlns:ev", evNS);

	// Needed for Internet Explorer, otherwise the viewport overflows
	if (svg.parentNode !== null) {
		var style = svg.getAttribute("style") || "";
		if (style.toLowerCase().indexOf("overflow") === -1) {
			svg.setAttribute("style", "overflow: hidden; " + style);
		}
	}
}
export const internetExplorerRedisplayInterval = 300;
export const refreshDefsGlobal = throttle(
	function () {
		var allDefs = document.querySelectorAll("defs");
		var allDefsCount = allDefs.length;
		for (var i = 0; i < allDefsCount; i++) {
			var thisDefs = allDefs[i];
			thisDefs.parentNode.insertBefore(thisDefs, thisDefs);
		}
	},
	this ? internetExplorerRedisplayInterval : null
);
export function setCTM(element, matrix, defs) {
	var that = this,
		s =
			"matrix(" +
			matrix.a +
			"," +
			matrix.b +
			"," +
			matrix.c +
			"," +
			matrix.d +
			"," +
			matrix.e +
			"," +
			matrix.f +
			")";

	element.setAttributeNS(null, "transform", s);
	if ("transform" in element.style) {
		element.style.transform = s;
	} else if ("-ms-transform" in element.style) {
		element.style["-ms-transform"] = s;
	} else if ("-webkit-transform" in element.style) {
		element.style["-webkit-transform"] = s;
	}

	// IE has a bug that makes markers disappear on zoom (when the matrix "a" and/or "d" elements change)
	// see http://stackoverflow.com/questions/17654578/svg-marker-does-not-work-in-ie9-10
	// and http://srndolha.wordpress.com/2013/11/25/svg-line-markers-may-disappear-in-internet-explorer-11/
	if (_browser === "ie" && !!defs) {
		// this refresh is intended for redisplaying the SVG during zooming
		defs.parentNode.insertBefore(defs, defs);
		// this refresh is intended for redisplaying the other SVGs on a page when panning a given SVG
		// it is also needed for the given SVG itself, on zoomEnd, if the SVG contains any markers that
		// are located under any other element(s).
		window.setTimeout(function () {
			that.refreshDefsGlobal();
		}, that.internetExplorerRedisplayInterval);
	}
}
export function getEventPoint(evt, svg) {
	var point = svg.createSVGPoint();

	mouseAndTouchNormalize(evt, svg);

	point.x = evt.clientX;
	point.y = evt.clientY;

	return point;
}
export function getSvgCenterPoint(svg, width, height) {
	return createSVGPoint(svg, width / 2, height / 2);
}
export function createSVGPoint(svg, x, y) {
	var point = svg.createSVGPoint();
	point.x = x;
	point.y = y;

	return point;
}
