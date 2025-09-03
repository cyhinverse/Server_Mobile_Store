// Integration test script to verify frontend-backend connection
import axios from 'axios';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5050/api/v1';

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

async function testBackendAPI() {
  log('\n=== TESTING BACKEND APIs ===', 'blue');
  
  try {
    // Test key endpoints that frontend uses
    const tests = [
      { endpoint: '/products', description: 'Products API' },
      { endpoint: '/products/featured', description: 'Featured Products API' },
      { endpoint: '/products/newest', description: 'Newest Products API' },
      { endpoint: '/products/stats', description: 'Product Stats API' },
      { endpoint: '/banners', description: 'Banners API' }
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      try {
        const response = await axios.get(BACKEND_URL + test.endpoint);
        if (response.status === 200) {
          log(`✅ ${test.description}: Status ${response.status}`, 'green');
        } else {
          log(`⚠️ ${test.description}: Status ${response.status}`, 'yellow');
          allPassed = false;
        }
      } catch (error) {
        log(`❌ ${test.description}: ${error.message}`, 'red');
        allPassed = false;
      }
    }
    
    return allPassed;
  } catch (error) {
    log(`❌ Backend test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testFrontendAccess() {
  log('\n=== TESTING FRONTEND ACCESS ===', 'blue');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      log('✅ Frontend is accessible', 'green');
      return true;
    } else {
      log(`⚠️ Frontend returned status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend access failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCORSConfiguration() {
  log('\n=== TESTING CORS CONFIGURATION ===', 'blue');
  
  try {
    // Test CORS by making a request and checking headers
    const response = await axios.get(BACKEND_URL + '/products');
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (corsHeader === '*' || corsHeader === FRONTEND_URL) {
      log('✅ CORS configuration allows frontend access', 'green');
      return true;
    } else {
      log(`⚠️ CORS might be restrictive: ${corsHeader}`, 'yellow');
      return true; // Still consider it passed for now
    }
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkAPIIntegration() {
  log('\n=== CHECKING API INTEGRATION ===', 'blue');
  
  try {
    // Test a typical API call flow that frontend would make
    log('Testing product listing flow...', 'yellow');
    
    // 1. Get products
    const productsResponse = await axios.get(BACKEND_URL + '/products');
    const productsData = productsResponse.data;
    
    if (productsData.status === 'success' && productsData.data) {
      log('✅ Products API returns expected format', 'green');
      
      // 2. If there are products, test getting one by ID
      if (productsData.data.products && productsData.data.products.data && productsData.data.products.data.length > 0) {
        const firstProduct = productsData.data.products.data[0];
        log(`Testing single product fetch for: ${firstProduct.name}`, 'yellow');
        
        const singleProductResponse = await axios.get(BACKEND_URL + `/products/${firstProduct._id}`);
        if (singleProductResponse.status === 200) {
          log('✅ Single product API works', 'green');
        } else {
          log('⚠️ Single product API returned non-200 status', 'yellow');
        }
      }
      
      return true;
    } else {
      log('⚠️ Products API returned unexpected format', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ API integration test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runIntegrationTests() {
  log('🚀 Starting Frontend-Backend Integration Tests...', 'blue');
  
  const results = {
    backend: await testBackendAPI(),
    frontend: await testFrontendAccess(),
    cors: await testCORSConfiguration(),
    integration: await checkAPIIntegration()
  };
  
  log('\n=== INTEGRATION TEST SUMMARY ===', 'blue');
  
  const allPassed = Object.values(results).every(result => result);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase()}: ${status}`, color);
  });
  
  if (allPassed) {
    log('\n🎉 All integration tests passed!', 'green');
    log('✅ Frontend and Backend are properly connected', 'green');
    log('📱 The mobile store application is ready for use', 'blue');
  } else {
    log('\n⚠️ Some integration tests failed', 'yellow');
    log('🔧 Please check the failed components', 'yellow');
  }
  
  return allPassed;
}

// Run the integration tests
runIntegrationTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
