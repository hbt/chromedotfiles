'use strict';

function listenShortcutReloadExtensionOnDemand() {
  chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
      case 'restartext':
        chrome.runtime.reload();
        break;
    }
  });
}


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

function injectJS(tabId, match) {
// attempt to execute default js
  chrome.tabs.executeScript(tabId, {
    file: 'chromedotfiles/default.js'
  }, function (res) {
    if (chrome.runtime.lastError) {
      // file not found, fail silently
      return;
    }
  });

  if (match) {
    // attempt to execute domain specific js
    chrome.tabs.executeScript(tabId, {
      file: 'chromedotfiles/' + match.hostname + '.js'
    }, function (res) {
      if (chrome.runtime.lastError) {
        // file not found, fail silently
        return;
      }
    });
  }
}

function injectCSS(tabId, match) {

  function injectCSSFile(tabId, filename) {

    let curl = chrome.runtime.getURL(`chromedotfiles/${filename}.css`)
    try {
      $.ajax({
        url: curl
      }).done(function (data) {
        if (data) {
          chrome.tabs.insertCSS(
            tabId,
            {
              code: data,
              runAt: "document_start",
              allFrames: true
            },
            function (res) {
            }
          );
        }
      }).error(function() {
        
      });
    } catch(e) {
      
    }
    

  }


  injectCSSFile(tabId, 'default')
  if (match) {
    injectCSSFile(tabId, match.hostname)
  }


}

function main() {
  listenShortcutReloadExtensionOnDemand()
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if(tab.url.startsWith('chrome')) {
      return;
    }
    var match = getLocation(tab.url);

    if (changeInfo.status === 'loading') {
      injectCSS(tabId, match);
    }


    if (changeInfo.status === 'complete') {
      injectJS(tabId, match);
    }
  });

}


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
  if (!(filepath instanceof Array)) {
    files = [filepath];
  }

  loadJSFile(tab.id, files, callbackFunctionName);
}


main()