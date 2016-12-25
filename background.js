'use strict';

function getLocation(href) {
  var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
  return match && {
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7]
  };
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var match = getLocation(tab.url);

  // load css early for no visible delays
  if(changeInfo.status === 'loading') {
    
    // attempt to insert domain specific css
    chrome.tabs.insertCSS(tabId, {
      file: 'chromedotfiles/default.css',
      runAt: 'document_start',
      allFrames: true
    }, function (res) {
      if (chrome.runtime.lastError) {
        // file not found, fail silently
        return;
      }
    });

    if (match) {
      // attempt to insert domain specific css
      chrome.tabs.insertCSS(tabId, {
        file: 'chromedotfiles/' + match.hostname + '.css',
        runAt: 'document_start',
        allFrames: true
      }, function(res) {
        if (chrome.runtime.lastError) {
          // file not found, fail silently
          return;
        }
      });
    }
  }
  
  
  if (changeInfo.status === 'complete') {
    
    // attempt to execute default js
    chrome.tabs.executeScript(tabId, {
      file: 'chromedotfiles/default.js'
    }, function(res) {
      if (chrome.runtime.lastError) {
        // file not found, fail silently
        return;
      }
    });

    if (match) {
      // attempt to execute domain specific js
      chrome.tabs.executeScript(tabId, {
        file: 'chromedotfiles/' + match.hostname + '.js'
      }, function(res) {
        if (chrome.runtime.lastError) {
          // file not found, fail silently
          return;
        }
      });
    }
  }
});

/**
 * simulates loading JS files in order passed in array and in sync mode instead of async
 * 
 * @param tabId
 * @param files
 * @param callbackFunctionName
 */
function loadJSFile(tabId, files, callbackFunctionName) {
  var port = chrome.tabs.connect(tabId, {});

  if (files.length === 0) {
    port.postMessage({
      action: callbackFunctionName
    });

    // exit recursion
    return;
  }

  var nfiles = files;
  var filename = nfiles.shift();
  chrome.tabs.executeScript(tabId, {
    file: 'chromedotfiles/' + filename
  }, res => {
    if (chrome.runtime.lastError) {
      port.postMessage({
        action: 'console.error',
        args: chrome.runtime.lastError
      });
    }

    loadJSFile(tabId, nfiles, callbackFunctionName);
  });
}

function loadJSFiles(filepath, callbackFunctionName, tab) {

  var files = filepath;
  if(!(filepath instanceof Array)) {
    files = [filepath];
  }
  
  loadJSFile(tab.id, files, callbackFunctionName);
}
