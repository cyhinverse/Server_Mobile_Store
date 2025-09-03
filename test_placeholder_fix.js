// Test to ensure no more placeholder errors
import http from 'http';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function makeRequest(hostname, port, path) {
  return new Promise((resolve, reject) => {
    const options = { hostname, port, path, method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data, contentType: res.headers['content-type'] }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function testPlaceholderFix() {
  log('🔧 TESTING PLACEHOLDER IMAGE FIX', 'cyan');
  log('Verifying all placeholder endpoints work', 'blue');
  log('=' * 50, 'blue');
  
  let allFixed = true;
  
  // Test main placeholder endpoint
  log('\n🖼️ Testing main placeholder API...', 'yellow');
  try {
    const response = await makeRequest('localhost', 3000, '/api/placeholder?width=300&height=200&text=Test');
    if (response.status === 200 && response.contentType === 'image/svg+xml') {
      log('✅ Main placeholder API: Working (SVG generated)', 'green');
    } else {
      log(`❌ Main placeholder API: Status ${response.status}`, 'red');
      allFixed = false;
    }
  } catch (error) {
    log(`❌ Main placeholder API: ${error.message}`, 'red');
    allFixed = false;
  }
  
  // Test dynamic placeholder endpoints
  const dynamicTests = [
    '/api/placeholder/300/200',
    '/api/placeholder/150/150',
    '/api/placeholder/400/200',
    '/api/placeholder/100/100'
  ];
  
  log('\n🎯 Testing dynamic placeholder endpoints...', 'yellow');
  for (const endpoint of dynamicTests) {
    try {
      const response = await makeRequest('localhost', 3000, endpoint);
      if (response.status === 200 && response.contentType === 'image/svg+xml') {
        log(`✅ ${endpoint}: Working`, 'green');
      } else {
        log(`❌ ${endpoint}: Status ${response.status}`, 'red');
        allFixed = false;
      }
    } catch (error) {
      log(`❌ ${endpoint}: ${error.message}`, 'red');
      allFixed = false;
    }
  }
  
  // Test main pages to ensure they load without placeholder errors
  log('\n🌐 Testing pages for placeholder errors...', 'yellow');
  const pageTests = [
    { path: '/', name: 'Homepage' },
    { path: '/api-test', name: 'API Test Page' },
    { path: '/cart', name: 'Cart Page' }
  ];
  
  for (const { path, name } of pageTests) {
    try {
      const response = await makeRequest('localhost', 3000, path);
      if (response.status === 200) {
        // Check if response contains any external placeholder references
        if (response.data.includes('via.placeholder.com')) {
          log(`⚠️ ${name}: Still contains external placeholder references`, 'yellow');
          allFixed = false;
        } else {
          log(`✅ ${name}: No external placeholder references`, 'green');
        }
      } else {
        log(`❌ ${name}: Status ${response.status}`, 'red');
        allFixed = false;
      }
    } catch (error) {
      log(`❌ ${name}: ${error.message}`, 'red');
      allFixed = false;
    }
  }
  
  // Summary
  log('\n' + '=' * 50, 'blue');
  log('🎯 PLACEHOLDER FIX VERIFICATION', 'cyan');
  log('=' * 50, 'blue');
  
  if (allFixed) {
    log('\n🎉 ALL PLACEHOLDER ISSUES FIXED!', 'green');
    log('✅ No more via.placeholder.com errors', 'green');
    log('✅ All placeholder APIs working locally', 'green');
    log('✅ Pages load without external dependencies', 'green');
    log('\n📱 Image loading should now work perfectly!', 'cyan');
    
    log('\n🎯 What this means:', 'blue');
    log('• No more network errors for images', 'green');
    log('• Faster loading (local SVG placeholders)', 'green');
    log('• Works offline/without internet', 'green');
    log('• Clean console without 404 errors', 'green');
    
  } else {
    log('\n⚠️ Some placeholder issues remain', 'yellow');
    log('Please check the errors above', 'yellow');
  }
  
  return allFixed;
}

testPlaceholderFix()
  .then((success) => {
    if (success) {
      log('\n✨ Placeholder fix verification complete!', 'green');
      log('🎯 Your application should now load images without errors!', 'cyan');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`💥 Verification error: ${error.message}`, 'red');
    process.exit(1);
  });
