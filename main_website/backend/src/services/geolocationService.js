import axios from 'axios';

// Cache for geolocation data to avoid repeated API calls
const locationCache = new Map();

// Helper function to get real IP geolocation
export const getIPLocation = async (ipAddress) => {
  try {
    // Skip geolocation for localhost/private IPs
    if (isPrivateIP(ipAddress)) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local'
      };
    }

    // Check cache first
    if (locationCache.has(ipAddress)) {
      return locationCache.get(ipAddress);
    }

    // Use ipapi.co (free, no API key required)
    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, {
      timeout: 5000 // 5 second timeout
    });

    const data = response.data;
    
    const location = {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || data.state || 'Unknown'
    };

    // Cache the result for 1 hour
    locationCache.set(ipAddress, location);
    
    // Clean up cache after 1 hour
    setTimeout(() => {
      locationCache.delete(ipAddress);
    }, 60 * 60 * 1000);

    return location;
  } catch (error) {
    console.error('Error fetching IP geolocation:', error.message);
    
    // Fallback to default location
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
};

// Helper function to check if IP is private/localhost
const isPrivateIP = (ip) => {
  if (!ip) return true;
  
  // Check for localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return true;
  }
  
  // Check for private IP ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^::1$/,                    // IPv6 localhost
    /^fe80:/,                   // IPv6 link-local
    /^fc00:/,                   // IPv6 unique local
    /^fd00:/                    // IPv6 unique local
  ];
  
  return privateRanges.some(range => range.test(ip));
};

// Alternative geolocation service (backup)
export const getIPLocationBackup = async (ipAddress) => {
  try {
    if (isPrivateIP(ipAddress)) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local'
      };
    }

    // Use ip-api.com as backup (free, no API key required)
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
      timeout: 5000
    });

    const data = response.data;
    
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        region: data.regionName || data.region || 'Unknown'
      };
    }
    
    throw new Error('API returned failure status');
  } catch (error) {
    console.error('Error fetching IP geolocation (backup):', error.message);
    
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
};
