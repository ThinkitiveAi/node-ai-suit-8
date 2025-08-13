#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Demo credentials from seeding
const demoCredentials = {
  patient: {
    email: 'john.doe@example.com',
    password: 'Demo123!@#'
  },
  provider: {
    email: 'dr.emily.carter@healthfirst.com',
    password: 'Demo123!@#'
  }
};

// Storage for tokens
let patientToken = '';
let providerToken = '';
let patientRefreshToken = '';
let providerRefreshToken = '';

// Storage for created resources
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
      }
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
    console.log(`   Details: ${details}`);
  }
  
  testResults.tests.push({ name: testName, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  console.log(''); // Empty line for readability
}

// Test functions
async function testHealthEndpoints() {
  console.log('🏥 Testing Health Endpoints...\n');

  // Test basic health check
  const health = await makeRequest('GET', '/health');
  logTest('GET /health', health.success && health.status === 200, 
    health.success ? 'Health check passed' : `Status: ${health.status}`);

  // Test readiness check
  const ready = await makeRequest('GET', '/health/ready');
  logTest('GET /health/ready', ready.success && ready.status === 200,
    ready.success ? 'Readiness check passed' : `Status: ${ready.status}`);

  // Test liveness check
  const live = await makeRequest('GET', '/health/live');
  logTest('GET /health/live', live.success && live.status === 200,
    live.success ? 'Liveness check passed' : `Status: ${live.status}`);

  // Test metrics
  const metrics = await makeRequest('GET', '/health/metrics');
  logTest('GET /health/metrics', metrics.success && metrics.status === 200,
    metrics.success ? 'Metrics endpoint accessible' : `Status: ${metrics.status}`);
}

async function testAuthenticationEndpoints() {
  console.log('🔐 Testing Authentication Endpoints...\n');

  // Test patient registration
  const newPatient = {
    firstName: 'Test',
    lastName: 'Patient',
    email: `test.patient.${Date.now()}@test.com`,
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
  logTest('POST /api/v1/patient/register', 
    patientRegister.success && patientRegister.status === 201,
    patientRegister.success ? 'Patient registered successfully' : `Error: ${JSON.stringify(patientRegister.error)}`);

  // Test provider registration
  const newProvider = {
    firstName: 'Dr. Test',
    lastName: 'Provider',
    email: `test.provider.${Date.now()}@test.com`,
    phoneNumber: `+1-555-${String(Math.random()).substring(2, 6)}`,
    password: 'Demo123!@#',
    specialization: 'General Medicine',
    licenseNumber: `MD-${Date.now()}`,
    yearsOfExperience: 5,
    clinicAddress: {
      street: '100 Medical Test Dr',
      city: 'Test City',
      state: 'TC',
      zip: '12345'
    }
  };

  const providerRegister = await makeRequest('POST', '/api/v1/provider/register', newProvider);
  logTest('POST /api/v1/provider/register',
    providerRegister.success && providerRegister.status === 201,
    providerRegister.success ? 'Provider registered successfully' : `Error: ${JSON.stringify(providerRegister.error)}`);

  // Test patient login (using demo account)
  const patientLogin = await makeRequest('POST', '/api/v1/patient/login', {
    emailOrPhone: demoCredentials.patient.email,
    password: demoCredentials.patient.password
  });
  
  if (patientLogin.success && patientLogin.data?.data?.tokens) {
    patientToken = patientLogin.data.data.tokens.accessToken;
    patientRefreshToken = patientLogin.data.data.tokens.refreshToken;
  }
  
  logTest('POST /api/v1/patient/login',
    patientLogin.success && patientLogin.status === 200,
    patientLogin.success ? 'Patient login successful' : `Error: ${JSON.stringify(patientLogin.error)}`);

  // Test provider login (using demo account)
  const providerLogin = await makeRequest('POST', '/api/v1/provider/login', {
    emailOrPhone: demoCredentials.provider.email,
    password: demoCredentials.provider.password
  });
  
  if (providerLogin.success && providerLogin.data?.data?.tokens) {
    providerToken = providerLogin.data.data.tokens.accessToken;
    providerRefreshToken = providerLogin.data.data.tokens.refreshToken;
  }
  
  logTest('POST /api/v1/provider/login',
    providerLogin.success && providerLogin.status === 200,
    providerLogin.success ? 'Provider login successful' : `Error: ${JSON.stringify(providerLogin.error)}`);

  // Test token refresh
  if (patientRefreshToken) {
    const refresh = await makeRequest('POST', '/api/v1/auth/refresh', {
      refreshToken: patientRefreshToken
    });
    logTest('POST /api/v1/auth/refresh',
      refresh.success && refresh.status === 200,
      refresh.success ? 'Token refresh successful' : `Error: ${JSON.stringify(refresh.error)}`);
  }

  // Test debug token endpoint
  if (patientToken) {
    const debugToken = await makeRequest('GET', '/api/v1/debug/token', null, {
      Authorization: `Bearer ${patientToken}`
    });
    logTest('GET /api/v1/debug/token',
      debugToken.success && debugToken.status === 200,
      debugToken.success ? 'Token validation successful' : `Error: ${JSON.stringify(debugToken.error)}`);
  }
}

async function testPatientEndpoints() {
  console.log('👥 Testing Patient Endpoints...\n');

  if (!patientToken) {
    logTest('Patient endpoints', false, 'No patient token available');
    return;
  }

  // Test get patient profile
  const getProfile = await makeRequest('GET', '/api/v1/patient/profile', null, {
    Authorization: `Bearer ${patientToken}`
  });
  logTest('GET /api/v1/patient/profile',
    getProfile.success && getProfile.status === 200,
    getProfile.success ? 'Patient profile retrieved' : `Error: ${JSON.stringify(getProfile.error)}`);

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

async function testProviderEndpoints() {
  console.log('🏥 Testing Provider Endpoints...\n');

  if (!providerToken) {
    logTest('Provider endpoints', false, 'No provider token available');
    return;
  }

  // Test get provider profile
  const getProfile = await makeRequest('GET', '/api/v1/provider/profile', null, {
    Authorization: `Bearer ${providerToken}`
  });
  logTest('GET /api/v1/provider/profile',
    getProfile.success && getProfile.status === 200,
    getProfile.success ? 'Provider profile retrieved' : `Error: ${JSON.stringify(getProfile.error)}`);

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

async function testAvailabilityEndpoints() {
  console.log('📅 Testing Availability Endpoints...\n');

  if (!providerToken) {
    logTest('Availability endpoints', false, 'No provider token available');
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

  if (createAvailability.success && createAvailability.data?.data?.id) {
    availabilitySlotId = createAvailability.data.data.id;
  }

  logTest('POST /api/v1/provider/availability',
    createAvailability.success && createAvailability.status === 201,
    createAvailability.success ? 'Availability slot created' : `Error: ${JSON.stringify(createAvailability.error)}`);

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
    getMyAvailability.success ? 'Provider availability retrieved' : `Error: ${JSON.stringify(getMyAvailability.error)}`);

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
    searchAvailability.success ? 'Availability search successful' : `Error: ${JSON.stringify(searchAvailability.error)}`);
}

async function testEnhancedAvailabilityEndpoints() {
  console.log('🔧 Testing Enhanced Availability Endpoints...\n');

  if (!providerToken) {
    logTest('Enhanced availability endpoints', false, 'No provider token available');
    return;
  }

  // Test create comprehensive availability
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const createComprehensive = await makeRequest('POST', '/api/v1/provider/availability/comprehensive', {
    daySlots: [
      {
        dayOfWeek: 'MONDAY',
        timeSlots: [
          {
            startTime: '09:00',
            endTime: '12:00',
            location: 'Room 101',
            isVirtual: false
          },
          {
            startTime: '14:00',
            endTime: '17:00',
            location: 'Virtual',
            isVirtual: true
          }
        ]
      }
    ],
    settings: {
      bookingWindowDays: 30,
      bookingWindowType: 'DAYS',
      timezone: 'America/New_York',
      newAppointmentDuration: 30,
      followUpAppointmentDuration: 15,
      minimumNoticeAmount: 2,
      minimumNoticeType: 'HOURS',
      eventBufferMinutes: 15
    }
  }, {
    Authorization: `Bearer ${providerToken}`
  });
  logTest('POST /api/v1/provider/availability/comprehensive',
    createComprehensive.success && createComprehensive.status === 201,
    createComprehensive.success ? 'Comprehensive availability created' : `Error: ${JSON.stringify(createComprehensive.error)}`);

  // Test get provider settings
  const getSettings = await makeRequest('GET', '/api/v1/provider/settings/availability', null, {
    Authorization: `Bearer ${providerToken}`
  });
  logTest('GET /api/v1/provider/settings/availability',
    getSettings.success && getSettings.status === 200,
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
  logTest('POST /api/v1/provider/settings/availability',
    updateSettings.success && (updateSettings.status === 200 || updateSettings.status === 201),
    updateSettings.success ? 'Provider settings updated' : `Error: ${JSON.stringify(updateSettings.error)}`);

  // Test create block day
  const createBlockDay = await makeRequest('POST', '/api/v1/provider/block-days', {
    date: dateStr,
    isFullDay: false,
    startTime: '12:00',
    endTime: '13:00',
    reason: 'Lunch break'
  }, {
    Authorization: `Bearer ${providerToken}`
  });

  if (createBlockDay.success && createBlockDay.data?.data?.id) {
    blockDayId = createBlockDay.data.data.id;
  }

  logTest('POST /api/v1/provider/block-days',
    createBlockDay.success && createBlockDay.status === 201,
    createBlockDay.success ? 'Block day created' : `Error: ${JSON.stringify(createBlockDay.error)}`);

  // Test get block days
  const getBlockDays = await makeRequest('GET', '/api/v1/provider/block-days', null, {
    Authorization: `Bearer ${providerToken}`
  });
  logTest('GET /api/v1/provider/block-days',
    getBlockDays.success && getBlockDays.status === 200,
    getBlockDays.success ? 'Block days retrieved' : `Error: ${JSON.stringify(getBlockDays.error)}`);

  // Test update block day
  if (blockDayId) {
    const updateBlockDay = await makeRequest('PUT', `/api/v1/provider/block-days/${blockDayId}`, {
      reason: 'Updated lunch break'
    }, {
      Authorization: `Bearer ${providerToken}`
    });
    logTest('PUT /api/v1/provider/block-days/:id',
      updateBlockDay.success && updateBlockDay.status === 200,
      updateBlockDay.success ? 'Block day updated' : `Error: ${JSON.stringify(updateBlockDay.error)}`);
  }
}

async function testLogoutEndpoints() {
  console.log('🚪 Testing Logout Endpoints...\n');

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

async function testDeleteEndpoints() {
  console.log('🗑️ Testing Delete Endpoints...\n');

  // Re-login to get fresh tokens for delete operations
  const providerLogin = await makeRequest('POST', '/api/v1/provider/login', {
    emailOrPhone: demoCredentials.provider.email,
    password: demoCredentials.provider.password
  });
  
  if (providerLogin.success && providerLogin.data?.data?.tokens) {
    const tempProviderToken = providerLogin.data.data.tokens.accessToken;

    // Test delete availability slot
    if (availabilitySlotId) {
      const deleteAvailability = await makeRequest('DELETE', `/api/v1/provider/availability/${availabilitySlotId}`, null, {
        Authorization: `Bearer ${tempProviderToken}`
      });
      logTest('DELETE /api/v1/provider/availability/:id',
        deleteAvailability.success && deleteAvailability.status === 200,
        deleteAvailability.success ? 'Availability slot deleted' : `Error: ${JSON.stringify(deleteAvailability.error)}`);
    }

    // Test delete block day
    if (blockDayId) {
      const deleteBlockDay = await makeRequest('DELETE', `/api/v1/provider/block-days/${blockDayId}`, null, {
        Authorization: `Bearer ${tempProviderToken}`
      });
      logTest('DELETE /api/v1/provider/block-days/:id',
        deleteBlockDay.success && deleteBlockDay.status === 200,
        deleteBlockDay.success ? 'Block day deleted' : `Error: ${JSON.stringify(deleteBlockDay.error)}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing...\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    await testHealthEndpoints();
    await testAuthenticationEndpoints();
    await testPatientEndpoints();
    await testProviderEndpoints();
    await testAvailabilityEndpoints();
    await testEnhancedAvailabilityEndpoints();
    await testLogoutEndpoints();
    await testDeleteEndpoints();

    // Print final results
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
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

    console.log('🎉 API testing completed!');
    console.log('');
    console.log('📚 API Documentation available at: http://localhost:3000/api/docs');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests(); 