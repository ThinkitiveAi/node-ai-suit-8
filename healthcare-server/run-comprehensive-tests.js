#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Storage for tokens and IDs
let patientToken = '';
let providerToken = '';
let patientRefreshToken = '';
let providerRefreshToken = '';
let availabilitySlotId = '';
let blockDayId = '';

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method: method.toUpperCase(),
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000 // 10 second timeout
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message
    };
  }
}

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const result = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${result} - ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.tests.push({ name: testName, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  console.log('');
}

// Test functions
async function testHealthEndpoints() {
  console.log('🏥 Testing Health Endpoints...\n');

  const health = await makeRequest('GET', '/health');
  logTest('GET /health', 
    health.success && health.status === 200,
    health.success ? 'Health check passed' : `Status: ${health.status}, Error: ${JSON.stringify(health.error)}`);

  const ready = await makeRequest('GET', '/health/ready');
  logTest('GET /health/ready',
    ready.success && ready.status === 200,
    ready.success ? 'Readiness check passed' : `Status: ${ready.status}`);

  const live = await makeRequest('GET', '/health/live');
  logTest('GET /health/live',
    live.success && live.status === 200,
    live.success ? 'Liveness check passed' : `Status: ${live.status}`);

  const metrics = await makeRequest('GET', '/health/metrics');
  logTest('GET /health/metrics',
    metrics.success && metrics.status === 200,
    metrics.success ? 'Metrics endpoint accessible' : `Status: ${metrics.status}`);
}

async function testPatientOperations() {
  console.log('👥 Testing Patient Operations...\n');

  // Test patient registration
  const newPatient = {
    firstName: 'John',
    lastName: 'TestPatient',
    email: `john.test.${Date.now()}@example.com`,
    phoneNumber: `+1-555-${String(Math.random()).substring(2, 6)}`,
    password: 'Demo123!@#',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TC',
      zip: '12345'
    }
  };

  const patientRegister = await makeRequest('POST', '/api/v1/patient/register', newPatient);
  const hasIntegerId = patientRegister.success && 
    patientRegister.data?.data?.user?.id && 
    typeof patientRegister.data.data.user.id === 'number';
  const hasUuid = patientRegister.success && 
    patientRegister.data?.data?.user?.uuid && 
    typeof patientRegister.data.data.user.uuid === 'string';

  logTest('POST /api/v1/patient/register',
    patientRegister.success && patientRegister.status === 201,
    patientRegister.success ? 
      `Patient registered - ID: ${patientRegister.data?.data?.user?.id} (${hasIntegerId ? 'Integer ✓' : 'Not Integer ✗'}), UUID: ${hasUuid ? 'Present ✓' : 'Missing ✗'}` : 
      `Error: ${JSON.stringify(patientRegister.error)}`);

  // Test patient login
  const patientLogin = await makeRequest('POST', '/api/v1/patient/login', {
    emailOrPhone: newPatient.email,
    password: newPatient.password
  });
  
  if (patientLogin.success && patientLogin.data?.data?.tokens) {
    patientToken = patientLogin.data.data.tokens.accessToken;
    patientRefreshToken = patientLogin.data.data.tokens.refreshToken;
  }
  
  logTest('POST /api/v1/patient/login',
    patientLogin.success && patientLogin.status === 200,
    patientLogin.success ? 'Patient login successful' : `Error: ${JSON.stringify(patientLogin.error)}`);

  // Test get patient profile
  if (patientToken) {
    const getProfile = await makeRequest('GET', '/api/v1/patient/profile', null, {
      Authorization: `Bearer ${patientToken}`
    });
    
    const profileHasIntegerId = getProfile.success && 
      getProfile.data?.data?.id && 
      typeof getProfile.data.data.id === 'number';
    
    logTest('GET /api/v1/patient/profile',
      getProfile.success && getProfile.status === 200,
      getProfile.success ? 
        `Profile retrieved - ID: ${getProfile.data?.data?.id} (${profileHasIntegerId ? 'Integer ✓' : 'Not Integer ✗'})` : 
        `Error: ${JSON.stringify(getProfile.error)}`);

    // Test update patient profile
    const updateProfile = await makeRequest('PATCH', '/api/v1/patient/profile', {
      address: {
        street: '456 Updated Test St',
        city: 'Updated City',
        state: 'UC',
        zip: '54321'
      }
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    
    logTest('PATCH /api/v1/patient/profile',
      updateProfile.success && updateProfile.status === 200,
      updateProfile.success ? 'Patient profile updated' : `Error: ${JSON.stringify(updateProfile.error)}`);
  }

  // Test token refresh
  if (patientRefreshToken) {
    const refresh = await makeRequest('POST', '/api/v1/auth/refresh', {
      refreshToken: patientRefreshToken
    });
    logTest('POST /api/v1/auth/refresh',
      refresh.success && refresh.status === 200,
      refresh.success ? 'Token refresh successful' : `Error: ${JSON.stringify(refresh.error)}`);
  }
}

async function testProviderOperations() {
  console.log('🏥 Testing Provider Operations...\n');

  // Test provider registration
  const newProvider = {
    firstName: 'Dr. Jane',
    lastName: 'TestProvider',
    email: `dr.jane.test.${Date.now()}@example.com`,
    phoneNumber: `+1-555-${String(Math.random()).substring(2, 6)}`,
    password: 'Demo123!@#',
    specialization: 'Cardiology',
    licenseNumber: `MD-${Date.now()}`,
    yearsOfExperience: 15,
    clinicAddress: {
      street: '100 Medical Center Dr',
      city: 'Test City',
      state: 'TC',
      zip: '12345'
    }
  };

  const providerRegister = await makeRequest('POST', '/api/v1/provider/register', newProvider);
  const hasIntegerId = providerRegister.success && 
    providerRegister.data?.data?.user?.id && 
    typeof providerRegister.data.data.user.id === 'number';
  const hasUuid = providerRegister.success && 
    providerRegister.data?.data?.user?.uuid && 
    typeof providerRegister.data.data.user.uuid === 'string';

  logTest('POST /api/v1/provider/register',
    providerRegister.success && providerRegister.status === 201,
    providerRegister.success ? 
      `Provider registered - ID: ${providerRegister.data?.data?.user?.id} (${hasIntegerId ? 'Integer ✓' : 'Not Integer ✗'}), UUID: ${hasUuid ? 'Present ✓' : 'Missing ✗'}` : 
      `Error: ${JSON.stringify(providerRegister.error)}`);

  // Test provider login
  const providerLogin = await makeRequest('POST', '/api/v1/provider/login', {
    emailOrPhone: newProvider.email,
    password: newProvider.password
  });
  
  if (providerLogin.success && providerLogin.data?.data?.tokens) {
    providerToken = providerLogin.data.data.tokens.accessToken;
    providerRefreshToken = providerLogin.data.data.tokens.refreshToken;
  }
  
  logTest('POST /api/v1/provider/login',
    providerLogin.success && providerLogin.status === 200,
    providerLogin.success ? 'Provider login successful' : `Error: ${JSON.stringify(providerLogin.error)}`);

  // Test get provider profile
  if (providerToken) {
    const getProfile = await makeRequest('GET', '/api/v1/provider/profile', null, {
      Authorization: `Bearer ${providerToken}`
    });
    
    const profileHasIntegerId = getProfile.success && 
      getProfile.data?.data?.id && 
      typeof getProfile.data.data.id === 'number';
    
    logTest('GET /api/v1/provider/profile',
      getProfile.success && getProfile.status === 200,
      getProfile.success ? 
        `Profile retrieved - ID: ${getProfile.data?.data?.id} (${profileHasIntegerId ? 'Integer ✓' : 'Not Integer ✗'})` : 
        `Error: ${JSON.stringify(getProfile.error)}`);

    // Test update provider profile
    const updateProfile = await makeRequest('PATCH', '/api/v1/provider/profile', {
      yearsOfExperience: 16,
      clinicAddress: {
        street: '200 Updated Medical Center Dr',
        city: 'Updated City',
        state: 'UC',
        zip: '54321'
      }
    }, {
      Authorization: `Bearer ${providerToken}`
    });
    
    logTest('PATCH /api/v1/provider/profile',
      updateProfile.success && updateProfile.status === 200,
      updateProfile.success ? 'Provider profile updated' : `Error: ${JSON.stringify(updateProfile.error)}`);
  }
}

async function testAvailabilityOperations() {
  console.log('📅 Testing Availability Operations...\n');

  if (!providerToken) {
    logTest('Availability operations', false, 'No provider token available');
    return;
  }

  // Test create availability slot
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const createAvailability = await makeRequest('POST', '/api/v1/provider/availability', {
    date: dateStr,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    maxAppointments: 1,
    isRecurring: false,
    timezone: 'America/New_York',
    notes: 'Test availability slot'
  }, {
    Authorization: `Bearer ${providerToken}`
  });

  const hasIntegerId = createAvailability.success && 
    createAvailability.data?.data?.id && 
    typeof createAvailability.data.data.id === 'number';
  const hasUuid = createAvailability.success && 
    createAvailability.data?.data?.uuid && 
    typeof createAvailability.data.data.uuid === 'string';

  if (createAvailability.success && createAvailability.data?.data?.id) {
    availabilitySlotId = createAvailability.data.data.id;
  }

  logTest('POST /api/v1/provider/availability',
    createAvailability.success && createAvailability.status === 201,
    createAvailability.success ? 
      `Availability slot created - ID: ${createAvailability.data?.data?.id} (${hasIntegerId ? 'Integer ✓' : 'Not Integer ✗'}), UUID: ${hasUuid ? 'Present ✓' : 'Missing ✗'}` : 
      `Error: ${JSON.stringify(createAvailability.error)}`);

  // Test bulk availability creation
  const createBulk = await makeRequest('POST', '/api/v1/provider/availability/bulk', {
    slots: [
      {
        date: dateStr,
        startTime: '09:00',
        endTime: '12:00',
        slotDuration: 30
      },
      {
        date: dateStr,
        startTime: '14:00',
        endTime: '17:00',
        slotDuration: 30
      }
    ]
  }, {
    Authorization: `Bearer ${providerToken}`
  });
  
  logTest('POST /api/v1/provider/availability/bulk',
    createBulk.success && createBulk.status === 201,
    createBulk.success ? 'Bulk availability created' : `Error: ${JSON.stringify(createBulk.error)}`);

  // Test get my availability
  const getMyAvailability = await makeRequest('GET', '/api/v1/provider/availability/my?page=1&limit=10', null, {
    Authorization: `Bearer ${providerToken}`
  });
  
  logTest('GET /api/v1/provider/availability/my',
    getMyAvailability.success && getMyAvailability.status === 200,
    getMyAvailability.success ? 
      `Provider availability retrieved - ${getMyAvailability.data?.data?.length || 0} slots found` : 
      `Error: ${JSON.stringify(getMyAvailability.error)}`);

  // Test update availability slot
  if (availabilitySlotId) {
    const updateAvailability = await makeRequest('PUT', `/api/v1/provider/availability/${availabilitySlotId}`, {
      notes: 'Updated test availability slot'
    }, {
      Authorization: `Bearer ${providerToken}`
    });
    
    logTest('PUT /api/v1/provider/availability/:id',
      updateAvailability.success && updateAvailability.status === 200,
      updateAvailability.success ? 'Availability slot updated' : `Error: ${JSON.stringify(updateAvailability.error)}`);
  }

  // Test search availability (public endpoint)
  const searchAvailability = await makeRequest('GET', `/api/v1/availability/search?date=${dateStr}&specialization=Cardiology`);
  logTest('GET /api/v1/availability/search',
    searchAvailability.success && searchAvailability.status === 200,
    searchAvailability.success ? 
      `Availability search successful - ${searchAvailability.data?.data?.length || 0} results found` : 
      `Error: ${JSON.stringify(searchAvailability.error)}`);
}

async function testEnhancedAvailabilityOperations() {
  console.log('🔧 Testing Enhanced Availability Operations...\n');

  if (!providerToken) {
    logTest('Enhanced availability operations', false, 'No provider token available');
    return;
  }

  // Test get provider settings
  const getSettings = await makeRequest('GET', '/api/v1/provider/settings/availability', null, {
    Authorization: `Bearer ${providerToken}`
  });
  
  logTest('GET /api/v1/provider/settings/availability',
    getSettings.success && (getSettings.status === 200 || getSettings.status === 404),
    getSettings.success ? 'Provider settings retrieved' : `Error: ${JSON.stringify(getSettings.error)}`);

  // Test create/update provider settings
  const updateSettings = await makeRequest('POST', '/api/v1/provider/settings/availability', {
    bookingWindowDays: 45,
    bookingWindowType: 'DAYS',
    timezone: 'America/New_York',
    newAppointmentDuration: 45,
    followUpAppointmentDuration: 20,
    minimumNoticeAmount: 4,
    minimumNoticeType: 'HOURS',
    eventBufferMinutes: 30
  }, {
    Authorization: `Bearer ${providerToken}`
  });
  
  const settingsHasIntegerId = updateSettings.success && 
    updateSettings.data?.data?.id && 
    typeof updateSettings.data.data.id === 'number';
  
  logTest('POST /api/v1/provider/settings/availability',
    updateSettings.success && (updateSettings.status === 200 || updateSettings.status === 201),
    updateSettings.success ? 
      `Provider settings updated - ID: ${updateSettings.data?.data?.id} (${settingsHasIntegerId ? 'Integer ✓' : 'Not Integer ✗'})` : 
      `Error: ${JSON.stringify(updateSettings.error)}`);

  // Test create block day
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const createBlockDay = await makeRequest('POST', '/api/v1/provider/block-days', {
    date: dateStr,
    isFullDay: false,
    startTime: '12:00',
    endTime: '13:00',
    reason: 'Test lunch break'
  }, {
    Authorization: `Bearer ${providerToken}`
  });

  const blockHasIntegerId = createBlockDay.success && 
    createBlockDay.data?.data?.id && 
    typeof createBlockDay.data.data.id === 'number';

  if (createBlockDay.success && createBlockDay.data?.data?.id) {
    blockDayId = createBlockDay.data.data.id;
  }

  logTest('POST /api/v1/provider/block-days',
    createBlockDay.success && createBlockDay.status === 201,
    createBlockDay.success ? 
      `Block day created - ID: ${createBlockDay.data?.data?.id} (${blockHasIntegerId ? 'Integer ✓' : 'Not Integer ✗'})` : 
      `Error: ${JSON.stringify(createBlockDay.error)}`);

  // Test get block days
  const getBlockDays = await makeRequest('GET', '/api/v1/provider/block-days', null, {
    Authorization: `Bearer ${providerToken}`
  });
  
  logTest('GET /api/v1/provider/block-days',
    getBlockDays.success && getBlockDays.status === 200,
    getBlockDays.success ? 
      `Block days retrieved - ${getBlockDays.data?.data?.length || 0} block days found` : 
      `Error: ${JSON.stringify(getBlockDays.error)}`);
}

async function testLogoutOperations() {
  console.log('🚪 Testing Logout Operations...\n');

  // Test patient logout
  if (patientToken && patientRefreshToken) {
    const patientLogout = await makeRequest('POST', '/api/v1/auth/logout', {
      refreshToken: patientRefreshToken
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    
    logTest('POST /api/v1/auth/logout (Patient)',
      patientLogout.success && patientLogout.status === 200,
      patientLogout.success ? 'Patient logout successful' : `Error: ${JSON.stringify(patientLogout.error)}`);
  }

  // Test provider logout
  if (providerToken && providerRefreshToken) {
    const providerLogout = await makeRequest('POST', '/api/v1/auth/logout', {
      refreshToken: providerRefreshToken
    }, {
      Authorization: `Bearer ${providerToken}`
    });
    
    logTest('POST /api/v1/auth/logout (Provider)',
      providerLogout.success && providerLogout.status === 200,
      providerLogout.success ? 'Provider logout successful' : `Error: ${JSON.stringify(providerLogout.error)}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Application Testing...\n');
  console.log('='.repeat(60));
  console.log('');

  const startTime = Date.now();

  try {
    await testHealthEndpoints();
    await testPatientOperations();
    await testProviderOperations();
    await testAvailabilityOperations();
    await testEnhancedAvailabilityOperations();
    await testLogoutOperations();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print final results
    console.log('='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('');

    if (testResults.failed > 0) {
      console.log('❌ FAILED TESTS:');
      testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details}`);
        });
      console.log('');
    }

    // Check for integer ID implementation
    const integerIdTests = testResults.tests.filter(test => 
      test.details.includes('Integer ✓') || test.details.includes('Not Integer ✗')
    );
    
    if (integerIdTests.length > 0) {
      console.log('🔢 INTEGER ID VERIFICATION:');
      integerIdTests.forEach(test => {
        const hasIntegerIds = test.details.includes('Integer ✓');
        console.log(`   ${hasIntegerIds ? '✅' : '❌'} ${test.name}: ${test.details}`);
      });
      console.log('');
    }

    console.log('🎉 Comprehensive application testing completed!');
    console.log('');
    console.log('📚 API Documentation: http://localhost:3000/api/docs');
    console.log('🏥 Health Check: http://localhost:3000/health');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests(); 