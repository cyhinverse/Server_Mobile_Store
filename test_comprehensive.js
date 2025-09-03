// Comprehensive API test script
import http from 'http';

const BASE_URL = 'localhost';
const PORT = 5050;
const API_BASE = '/api/v1';

// Colors for console output
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

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: API_BASE + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(path, method = 'GET', expectedStatus = 200, description = '') {
  try {
    log(`\n${description || `Testing ${method} ${path}`}`, 'yellow');
    const response = await makeRequest(path, method);
    
    if (response.status === expectedStatus) {
      log(`✅ SUCCESS - Status: ${response.status}`, 'green');
    } else {
      log(`⚠️ UNEXPECTED - Status: ${response.status} (expected ${expectedStatus})`, 'yellow');
    }
    
    // Try to parse JSON
    try {
      const jsonData = JSON.parse(response.data);
      log(`📄 Response type: Valid JSON`, 'blue');
      if (jsonData.message) {
        log(`📝 Message: ${jsonData.message}`, 'blue');
      }
    } catch (e) {
      log(`📄 Response type: Plain text or invalid JSON`, 'blue');
    }
    
    return response.status === expectedStatus;
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function runComprehensiveTests() {
  log('🚀 Starting Comprehensive API Tests...', 'blue');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Product API Tests
  log('\n=== PRODUCT API TESTS ===', 'blue');
  
  totalTests++;
  if (await testEndpoint('/products', 'GET', 200, '1. Get all products')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/products/stats', 'GET', 200, '2. Get product stats')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/products/featured', 'GET', 200, '3. Get featured products')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/products/newest', 'GET', 200, '4. Get newest products')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/products/popular', 'GET', 200, '5. Get popular products')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/products/search?q=iphone', 'GET', 200, '6. Search products')) passedTests++;
  
  // User API Tests (Protected routes)
  log('\n=== USER API TESTS (Protected) ===', 'blue');
  
  totalTests++;
  if (await testEndpoint('/users', 'GET', 401, '7. Get users (should be protected)')) passedTests++;
  
  // Auth API Tests
  log('\n=== OTHER API TESTS ===', 'blue');
  
  totalTests++;
  if (await testEndpoint('/categories', 'GET', 200, '8. Get categories')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/brands', 'GET', 200, '9. Get brands')) passedTests++;
  
  totalTests++;
  if (await testEndpoint('/banners', 'GET', 200, '10. Get banners')) passedTests++;
  
  // Summary
  log('\n=== TEST SUMMARY ===', 'blue');
  log(`Tests passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed successfully!', 'green');
    log('✅ APIs are working correctly and returning expected status codes', 'green');
    return true;
  } else {
    log(`⚠️ ${totalTests - passedTests} test(s) failed`, 'yellow');
    return false;
  }
}

// Run the tests
runComprehensiveTests()
  .then((success) => {
    if (success) {
      log('\n🧹 Auto-cleanup: All APIs tested successfully!', 'green');
      log('📋 Summary: Product API (200 ✅), User API (401 ✅), Other APIs tested', 'blue');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
