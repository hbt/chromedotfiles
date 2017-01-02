'use strict';


/**
 * this loads the JS files.
 * filepath can be a single file or an array of files
 * assumes path is relative to chromedotfiles directory
 *
 *
 * Alternative design idea is to use the chrome manifest web_accessible_resources
 * use wildcards to whitelist the whole js/css in the chromedotfiles directory
 * then, use chrome.extension.getURL and load them by adding them in the head
 * This way, no need for any changes in the background.js and the user can write their own load function or use the default one
 *
 * @param filepath
 * @param callbackFunctionName
 */
function loadJS(filepath, callbackFunctionName) {
  Post({
    action: 'loadJSFiles',
    args: arguments
  });
}


document.addEventListener('DOMContentLoaded', function () {

  // load chrome.css if applicable
  if (window.location.href.startsWith('chrome://')) {
    var url = chrome.extension.getURL('chromedotfiles/chrome.css');
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    head.appendChild(link);
  }
 
}, false);


