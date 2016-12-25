'use strict';


function loadJS(filepath, callbackFunctionName) {
  Post({
    action: 'loadJSFiles',
    args: arguments
  });
}  
