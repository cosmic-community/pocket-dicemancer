(function() {
  if (window.self === window.top) return;

  var logs = [];
  var MAX_LOGS = 500;

  var originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  function serialize(arg) {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, function(key, value) {
          if (typeof value === 'function') return '[Function]';
          if (value instanceof Error) return value.toString();
          return value;
        }, 2);
      } catch (e) {
        return '[Object]';
      }
    }
    return String(arg);
  }

  function captureLog(level, args) {
    var timestamp = new Date().toISOString();
    var message = Array.prototype.map.call(args, serialize).join(' ');

    var logEntry = {
      timestamp: timestamp,
      level: level,
      message: message,
      url: window.location.href
    };

    logs.push(logEntry);
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    try {
      window.parent.postMessage({
        type: 'console-log',
        log: logEntry
      }, '*');
    } catch (e) {}
  }

  console.log = function() { originalConsole.log.apply(console, arguments); captureLog('log', arguments); };
  console.warn = function() { originalConsole.warn.apply(console, arguments); captureLog('warn', arguments); };
  console.error = function() { originalConsole.error.apply(console, arguments); captureLog('error', arguments); };
  console.info = function() { originalConsole.info.apply(console, arguments); captureLog('info', arguments); };
  console.debug = function() { originalConsole.debug.apply(console, arguments); captureLog('debug', arguments); };

  window.addEventListener('error', function(event) {
    captureLog('error', ['Unhandled error: ' + event.message + ' at ' + event.filename + ':' + event.lineno]);
  });

  window.addEventListener('unhandledrejection', function(event) {
    captureLog('error', ['Unhandled promise rejection: ' + (event.reason ? event.reason.toString() : 'unknown')]);
  });

  function sendReady() {
    try {
      window.parent.postMessage({
        type: 'console-capture-ready',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) {}
  }

  function sendRouteChange() {
    try {
      window.parent.postMessage({
        type: 'route-change',
        route: {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          href: window.location.href
        },
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) {}
  }

  if (document.readyState === 'complete') {
    sendReady();
    sendRouteChange();
  } else {
    window.addEventListener('load', function() {
      sendReady();
      sendRouteChange();
    });
  }

  var origPushState = history.pushState;
  history.pushState = function() {
    origPushState.apply(history, arguments);
    sendRouteChange();
  };

  var origReplaceState = history.replaceState;
  history.replaceState = function() {
    origReplaceState.apply(history, arguments);
    sendRouteChange();
  };

  window.addEventListener('popstate', sendRouteChange);
  window.addEventListener('hashchange', sendRouteChange);
})();