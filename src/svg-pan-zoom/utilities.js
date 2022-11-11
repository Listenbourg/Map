export function extend(target, source) {
	target = target || {};
	for (var prop in source) {
		// Go recursively
		if (isObject(source[prop])) {
			target[prop] = extend(target[prop], source[prop]);
		} else {
			target[prop] = source[prop];
		}
	}
	return target;
}
export function isElement(o) {
	return (
		o instanceof HTMLElement ||
		o instanceof SVGElement ||
		o instanceof SVGSVGElement || //DOM2
		(o &&
			typeof o === "object" &&
			o !== null &&
			o.nodeType === 1 &&
			typeof o.nodeName === "string")
	);
}
export function isObject(o) {
	return Object.prototype.toString.call(o) === "[object Object]";
}
export function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
export function getSvg(elementOrSelector) {
	var element, svg;

	if (!isElement(elementOrSelector)) {
		// If selector provided
		if (
			typeof elementOrSelector === "string" ||
			elementOrSelector instanceof String
		) {
			// Try to find the element
			element = document.querySelector(elementOrSelector);

			if (!element) {
				throw new Error(
					"Provided selector did not find any elements. Selector: " +
						elementOrSelector
				);
				return null;
			}
		} else {
			throw new Error("Provided selector is not an HTML object nor String");
			return null;
		}
	} else {
		element = elementOrSelector;
	}

	if (element.tagName.toLowerCase() === "svg") {
		svg = element;
	} else {
		if (element.tagName.toLowerCase() === "object") {
			svg = element.contentDocument.documentElement;
		} else {
			if (element.tagName.toLowerCase() === "embed") {
				svg = element.getSVGDocument().documentElement;
			} else {
				if (element.tagName.toLowerCase() === "img") {
					throw new Error(
						'Cannot script an SVG in an "img" element. Please use an "object" element or an in-line SVG.'
					);
				} else {
					throw new Error("Cannot get SVG.");
				}
				return null;
			}
		}
	}

	return svg;
}
export function proxy(fn, context) {
	return function () {
		return fn.apply(context, arguments);
	};
}
export function getType(o) {
	return Object.prototype.toString
		.apply(o)
		.replace(/^\[object\s/, "")
		.replace(/\]$/, "");
}
export function mouseAndTouchNormalize(evt, svg) {
	// If no clientX then fallback
	if (evt.clientX === void 0 || evt.clientX === null) {
		// Fallback
		evt.clientX = 0;
		evt.clientY = 0;

		// If it is a touch event
		if (evt.touches !== void 0 && evt.touches.length) {
			if (evt.touches[0].clientX !== void 0) {
				evt.clientX = evt.touches[0].clientX;
				evt.clientY = evt.touches[0].clientY;
			} else if (evt.touches[0].pageX !== void 0) {
				var rect = svg.getBoundingClientRect();

				evt.clientX = evt.touches[0].pageX - rect.left;
				evt.clientY = evt.touches[0].pageY - rect.top;
			}
			// If it is a custom event
		} else if (evt.originalEvent !== void 0) {
			if (evt.originalEvent.clientX !== void 0) {
				evt.clientX = evt.originalEvent.clientX;
				evt.clientY = evt.originalEvent.clientY;
			}
		}
	}
}
export function isDblClick(evt, prevEvt) {
	// Double click detected by browser
	if (evt.detail === 2) {
		return true;
	}

	// Try to compare events
	else if (prevEvt !== void 0 && prevEvt !== null) {
		var timeStampDiff = evt.timeStamp - prevEvt.timeStamp, // should be lower than 250 ms
			touchesDistance = Math.sqrt(
				Math.pow(evt.clientX - prevEvt.clientX, 2) +
					Math.pow(evt.clientY - prevEvt.clientY, 2)
			);

		return timeStampDiff < 250 && touchesDistance < 10;
	}

	// Nothing found
	return false;
}
export const now =
	Date.now ||
	function () {
		return new Date().getTime();
	};
export function throttle(func, wait, options) {
	var that = this;
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) {
		options = {};
	}
	var later = function () {
		previous = options.leading === false ? 0 : that.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) {
			context = args = null;
		}
	};
	return function () {
		var now = that.now();
		if (!previous && options.leading === false) {
			previous = now;
		}
		var remaining = wait - (now - previous);
		context = this; // eslint-disable-line consistent-this
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			clearTimeout(timeout);
			timeout = null;
			previous = now;
			result = func.apply(context, args);
			if (!timeout) {
				context = args = null;
			}
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
}
export function createRequestAnimationFrame(refreshRate) {
	var timeout = null;

	// Convert refreshRate to timeout
	if (refreshRate !== "auto" && refreshRate < 60 && refreshRate > 1) {
		timeout = Math.floor(1000 / refreshRate);
	}

	if (timeout === null) {
		return window.requestAnimationFrame || requestTimeout(33);
	} else {
		return requestTimeout(timeout);
	}
}

/**
 * Create a callback that will execute after a given timeout
 *
 * @param  {Function} timeout
 * @return {Function}
 */
function requestTimeout(timeout) {
	return function (callback) {
		window.setTimeout(callback, timeout);
	};
}
