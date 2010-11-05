/*
 * jsQueue - a script queue manager for squirrels and space-fish.
 * URL: http://povert.com/fun/ygetman/
 * License: http://povert.com/fun/ygetman/license.txt
 * Version: 0.1
 *
 * jsQueue allows you to request that a script be loaded, but not if
 * it's already been loaded.  Executes callbacks 
 *
 * Requires YUI's Get and the YAHOO global object or jQuery.
 * 
 * Usage:
 *
 * jsQueue.get('script.js', callback);
 *
 * Passing arrays work as well:
 *
 * jsQueue.get(['script1.js', 'script2.js', 'script3.js'], callback);
 *
 * Bugs:
 * - The same file requested absolutely vs. relative will be requested
 *   both times.  This is not the case with absolute vs. full URL.
 * - 
 */
var jsQueue = function() {
	var objPro = Object.prototype;
	var _queue = {};
	var _get = (window.jQuery && jQuery.getScript) ? jQuery.getScript : ((window.YAHOO && YAHOO.util && YAHOO.util.Get) ? YAHOO.util.Get.script : false);
	var _log = window.YAHOO && YAHOO.log ? YAHOO.log : (window.console && console.log ? console.log : false);
	var _trim = window.YAHOO ? YAHOO.lang.trim : (window.jQuery ? jQuery.trim : false);
	var _addToQueue = function(url,cb) {
		var execCallbacks = function() {
			var cbLen = _queue[url].callback.length,
			    i = 0;
			_queue[url].status = 'complete';
			_log('executing callbacks');
			// These should run in order.
			for (;i < cbLen; i+=1) {
				_log(_queue[url].callback[i]);
				_queue[url].callback[i]();
			};
		}
		var callbackFail = function() {
			_log(url + ' failed to load');
			_queue[url].status = 'fail';
		};

		_queue[url] = {
			status: 'inProgress'
		};
		_appendCallback(_queue[url], function() {_log('finished loading (' + url + ')');cb();});
		var scriptCallback = window.YAHOO ? {
			onSuccess: execCallbacks,
			onFailure: callbackFail
		} : execCallbacks;
		_get(url, scriptCallback);
	};
	var _appendCallback = function(qObj, cb) {
		var isFunc = typeof cb === 'function' || objPro.toString.apply(url) === '[object Function]';
		if (qObj.status != 'complete') {
			_log('not loaded, appending to callback queue.');
			qObj.callback = qObj.callback || [];
			if (isFunc) {
				qObj.callback.push(cb);
			};
		} else {
			_log('already loaded, executing now.');
			if (isFunc) {
				qObj.callback.push(cb); // Not needed?
				cb();
			};
		}
	};
	var _getMultiple = function(a, cb) {
		var script = a.shift(),
		    i = a.length - 1;
		// If the same script is requested more than once, toss the extras
		for (; i >= 0; i-=1){
			if (script == a[i]) {
				a.splice(i);
			};
		};
		jsQueue.get(script, function(){
			if (a.length > 0) {
				_getMultiple(a, cb);
			} else {
				cb();
			};
		});
	};
	return {
		get: function(url, cb) {
			if (typeof url === 'string') {
				url = _trim(url);
				var choppedUrl = url.replace(document.location.protocol + '//' + document.location.host, '');
				if (choppedUrl.match(/^\//)) {
					url = choppedUrl;
				}
				console.log(url);
				if (_queue[url]) {
			        // In queue; append to callback
			        _log('In queue; append to callback (' + url + ')');
			        _appendCallback(_queue[url], cb);
				} else {
			        // Not in queue; add it
			        _log('Not in queue; add it (' + url + ')');
			        _addToQueue(url,cb);
				};
			} else if (objPro.toString.apply(url) === '[object Array]') {
				_getMultiple(url, cb);
			};
		}
	};
}();