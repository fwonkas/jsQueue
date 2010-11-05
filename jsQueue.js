/*
 * jsQueue - a YUI Get.script queue manager for squirrels and space-fish.
 * URL: http://povert.com/fun/ygetman/
 * License: http://povert.com/fun/ygetman/license.txt
 * Version: 1. (0.x releases are for people who believe in fractions)
 *
 * jsQueue allows you to request that a script be loaded, but not if
 * it's already been loaded.
 *
 * Requires YUI's Get and the YAHOO global object.
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
 *   both times.  Will be addressed in version 3.dog.  I believe in
 *   dog fractions.
 */
var jsQueue = function() {
	var _queue = {};
	var _addToQueue = function(url,cb) {
		_queue[url] = {
			status: 'inProgress'
		};
		_appendCallback(_queue[url], function() {YAHOO.log('finished loading (' + url + ')');cb();});
		YAHOO.util.Get.script(url, {
			onSuccess: function() {
				var cbLen = _queue[url].callback.length,
				    i = 0;
				_queue[url].status = 'complete';
				YAHOO.log('executing callbacks');
				// These should run in order.
				for (;i < cbLen; i+=1) {
					_queue[url].callback[i]();
				}
			},
			onFailure: function() {
				_queue[url].status = 'fail';
			}
		});
	};
	var _appendCallback = function(qObj, cb) {
		if (qObj.status != 'complete') {
			YAHOO.log('not loaded, appending to callback queue.');
			qObj.callback = qObj.callback || [];
			if (YAHOO.lang.isFunction(cb)) {
				qObj.callback.push(cb);
			}
		} else {
			YAHOO.log('already loaded, executing now.');
			if (YAHOO.lang.isFunction(cb)) {
				qObj.callback.push(cb); // Not needed?
				cb();
			}
		}
	};
	var _getMultiple = function(a, cb) {
		var script = a.shift(),
		    i = a.length - 1;
		// If the same script is requested more than once, toss the extras
		for (; i >= 0; i-=1){
			if (script == a[i]) {
				a.splice(i);
			}
		};
		jsQueue.get(script, function(){
			if (a.length > 0) {
				_getMultiple(a, cb);
			} else {
				cb();
			}
		});
	};
	return {
		get: function(url, cb) {
			if (YAHOO.lang.isString(url)) {
				url = YAHOO.lang.trim(url);
				var choppedUrl = url.replace(document.location.protocol + '//' + document.location.host, '');
				if (choppedUrl.match(/^\//)) {
					url = choppedUrl;
				}
				console.log(url);
				if (_queue[url]) {
			        // In queue; append to callback
			        YAHOO.log('In queue; append to callback (' + url + ')');
			        _appendCallback(_queue[url], cb);
				} else {
			        // Not in queue; add it
			        YAHOO.log('Not in queue; add it (' + url + ')');
			        _addToQueue(url,cb);
				}
			} else if (YAHOO.lang.isArray(url)) {
				_getMultiple(url, cb);
			}
		}
	};
}();