'use strict';


function loadJS(filepath, callbackFunctionName) {
  Post({
    action: 'loadJS',
    args: arguments
  });
}  
