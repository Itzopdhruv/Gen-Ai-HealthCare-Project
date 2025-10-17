// Axios configuration to handle global object issues
import axios from 'axios';

// Ensure global objects are available before axios initialization
if (typeof global === 'undefined') {
  window.global = globalThis;
}

if (typeof process === 'undefined') {
  window.process = { env: {} };
}

// Configure axios with proper defaults
const axiosConfig = {
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure proper adapter is used
  adapter: 'xhr', // Force XMLHttpRequest adapter instead of fetch
};

export default axiosConfig;
