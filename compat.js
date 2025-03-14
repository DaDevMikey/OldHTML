// Compatibility script for older browsers

// Define Array forEach for older browsers
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        if (this == null) {
            throw new TypeError('Array.prototype.forEach called on null or undefined');
        }
        
        var T, k;
        var O = Object(this);
        var len = O.length >>> 0;
        
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        
        if (arguments.length > 1) {
            T = thisArg;
        }
        
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

// Simple XHR wrapper for older browsers
function httpRequest(url, callback) {
    var xhr;
    
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // For very old IE browsers (optional)
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                // Browser doesn't support AJAX
                return false;
            }
        }
    }
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                callback(xhr.responseText);
            } else {
                callback(null, 'Error: ' + xhr.status);
            }
        }
    };
    
    xhr.open('GET', url, true);
    xhr.send(null);
    
    return true;
}

// Element.textContent polyfill
if (Object.defineProperty && Object.getOwnPropertyDescriptor && 
    Object.getOwnPropertyDescriptor(Element.prototype, "textContent") && 
    !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get) {
    (function() {
        var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
        Object.defineProperty(Element.prototype, "textContent", {
            get: function() {
                return innerText.get.call(this);
            },
            set: function(s) {
                return innerText.set.call(this, s);
            }
        });
    })();
}

