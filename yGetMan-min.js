/*
 * yGetMan - a YUI Get.script queue manager for squirrels and space-fish.
 * URL: http://povert.com/fun/ygetman/
 * License: http://povert.com/fun/ygetman/license.txt
 * Version: 1. (0.x releases are for people who believe in fractions)
 *
 * yGetMan allows you to request that a script be loaded, but not if
 * it's already been loaded.
 *
 * Requires YUI's Get and the YAHOO global object, obviously.
 * 
 * Usage:
 *
 * yGetMan.get('script.js', callback);
 *
 * Passing arrays work as well:
 *
 * yGetMan.get(['script1.js', 'script2.js', 'script3.js'], callback);
 *
 * Bugs:
 * - The same file requested absolutely vs. relative will be requested
 *   both times.  Will be addressed in version 3.dog.  I believe in
 *   dog fractions.
 */
var yGetMan=function(){var C={};var B=function(F,E){C[F]={status:"inProgress"};D(C[F],function(){YAHOO.log("finished loading ("+F+")");E()});YAHOO.util.Get.script(F,{onSuccess:function(){C[F].status="complete";YAHOO.log("executing callbacks");for(var G=0;G<C[F].callback.length;G++){C[F].callback[G]()}},onFailure:function(){C[F].status="fail"}})};var D=function(F,E){if(F.status!="complete"){YAHOO.log("not loaded, appending to callback queue.");F.callback=F.callback||[];if(YAHOO.lang.isFunction(E)){F.callback.push(E)}}else{YAHOO.log("already loaded, executing now.");if(YAHOO.lang.isFunction(E)){F.callback.push(E);E()}}};var A=function(F,E){var G=F.shift();for(var H=0;H<F.length;H++){if(G==F[H]){F.splice(H)}}yGetMan.get(G,function(){if(F.length>0){A(F,E)}else{E()}})};return{get:function(F,E){if(YAHOO.lang.isString(F)){F=YAHOO.lang.trim(F);if(C[F]){YAHOO.log("In queue; append to callback ("+F+")");D(C[F],E)}else{YAHOO.log("Not in queue; add it ("+F+")");B(F,E)}}else{if(YAHOO.lang.isArray(F)){A(F,E)}}}}}();