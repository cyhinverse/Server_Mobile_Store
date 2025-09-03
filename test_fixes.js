// Quick test for fixed endpoints
import http from 'http';

const BASE_URL = 'localhost';
const PORT = 5050;
const API_BASE = '/api/v1';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: API_BASE + path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => { reject(error); });
    req.end();
  });
}

async function testFixedEndpoints() {
  log('🔧 Testing Fixed Endpoints...', 'blue');
  
  const tests = [
    { path: '/brands', name: 'Brands API' },
    { path: '/categories', name: 'Categories API' },
    { path: '/products/search?q=iphone', name: 'Product Search' }
  ];
  
  for (const test of tests) {
    try {
      log(`\nTesting ${test.name}...`, 'yellow');
      const response = await makeRequest(test.path);
      
      if (response.status === 200) {
        log(`✅ ${test.name}: Status ${response.status}`, 'green');
        try {
          const jsonData = JSON.parse(response.data);
          if (jsonData.message) {
            log(`📝 Message: ${jsonData.message}`, 'blue');
          }
        } catch (e) {
          log(`📄 Response: ${response.data.substring(0, 100)}...`, 'blue');
        }
      } else {
        log(`❌ ${test.name}: Status ${response.status}`, 'red');
        log(`Error: ${response.data.substring(0, 200)}`, 'red');
      }
    } catch (error) {
      log(`❌ ${test.name}: ${error.message}`, 'red');
    }
  }
  
  log('\n✅ Fix verification completed!', 'green');
}

testFixedEndpoints();
