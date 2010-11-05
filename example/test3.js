(function() {
	var all = document.getElementsByTagName('*');
	var thisTag = all[all.length - 1];
	var magic = document.createElement('div');
	magic.appendChild(document.createTextNode('(test3.js running)'));
	thisTag.parentNode.insertBefore(magic, thisTag);
	magic.style.fontSize = '10px';
})();