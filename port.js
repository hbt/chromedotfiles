'use strict';


chrome.extension.onConnect.addListener(port => {
  port.onMessage.addListener(msg => {
    var tab = port.sender.tab;
    var actions = msg.action.split('.');

    // Action /*Function*/
    var action = window[actions.shift()];
    while (action && actions[0]) {
      action = action[actions.shift()];
    }

    var args = Object.values(msg.args || {});
    if (tab) {
      args.push(tab);
    }

    if (action instanceof Function) {
      action.apply('', args);
    }
  });
});


function Post(msg) {
  var port = chrome.extension.connect();
  port.postMessage(msg);
}