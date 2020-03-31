function isReady () {
  return (document.readyState === 'complete' ||
          (document.readyState !== 'loading' && !document.documentElement.doScroll));
}


function onReady (callback) {
  if (isReady()) {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}


/**
 * Source: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
 */
function getClosest (elem, selector) {
	// Element.matches() polyfill
	if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s);
        var i = matches.length;

        while (--i >= 0 && matches.item(i) !== this) {}

        return i > -1;
      };
	}

	// Get the closest matching element
	for (;elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) {
      return elem;
    }
	}

	return null;
}


function remove (node) {
  node.parentNode.removeChild(node);
}



module.exports = {
  isReady,
  onReady,
  getClosest,
  remove
};
