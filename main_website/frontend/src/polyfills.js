// Polyfills for global objects to fix axios/fetch issues

// Ensure globalThis is available
if (typeof globalThis === 'undefined') {
  window.globalThis = window;
}

// Polyfill for global
if (typeof global === 'undefined') {
  window.global = globalThis;
}

// Polyfill for process.env if needed
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

// Ensure Request and Response are available for axios
if (typeof Request === 'undefined') {
  // Use native fetch API - Request/Response should be available in modern browsers
  console.warn('Request object not available, using fetch polyfill');
}

// Additional polyfills for axios compatibility
if (typeof Buffer === 'undefined') {
  // Buffer polyfill if needed
  window.Buffer = window.Buffer || {};
}

// Ensure proper global object structure
if (!window.global) {
  window.global = globalThis;
}

// Fix for axios destructuring issues
if (typeof window !== 'undefined') {
  // Ensure the global object has the expected structure
  if (!window.global) {
    window.global = globalThis;
  }
  
  // Ensure process is available
  if (!window.process) {
    window.process = { env: {} };
  }
}

// Fix for Ant Design globalThis.getRootPrefixCls error
if (typeof window !== 'undefined' && window.globalThis) {
  // Add missing Ant Design functions to globalThis
  if (!window.globalThis.getRootPrefixCls) {
    window.globalThis.getRootPrefixCls = function() {
      return 'ant';
    };
  }
  
  // Add other potential missing Ant Design functions
  if (!window.globalThis.getPrefixCls) {
    window.globalThis.getPrefixCls = function(suffixCls, customizePrefixCls) {
      if (customizePrefixCls) return customizePrefixCls;
      return suffixCls ? `ant-${suffixCls}` : 'ant';
    };
  }
}
