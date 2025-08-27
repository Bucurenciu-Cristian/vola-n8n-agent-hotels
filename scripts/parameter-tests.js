/**
 * Comprehensive Test Suite for Apify Scraper Parameters
 * Test critical parameter validation and edge cases
 */

const { validateScraperParameters, cleanUrlsForReviewScraper } = require('./parameter-validation.js');
const { createParameterMonitor } = require('./debug-monitor.js');

class ParameterTestSuite {
  constructor() {
    this.testResults = [];
    this.monitor = createParameterMonitor('test-session');
  }

  // Run all tests
  runAllTests() {
    console.log('🚀 Starting Parameter Test Suite...\n');
    
    this.testFlexWindowValidation();
    this.testDateValidation();
    this.testUrlCleaning();
    this.testPriceRangeValidation();
    this.testPropertyTypeValidation();
    this.testAirbnbSpecificValidation();
    this.testEdgeCases();
    
    this.generateTestReport();
    return this.testResults;
  }

  // Test flexWindow parameter (CRITICAL)
  testFlexWindowValidation() {
    console.log('📋 Testing flexWindow validation...');
    
    const testCases = [
      // Valid cases
      { flexWindow: '0', expected: true, description: 'Valid flexWindow: 0' },
      { flexWindow: '1', expected: true, description: 'Valid flexWindow: 1' },
      { flexWindow: '2', expected: true, description: 'Valid flexWindow: 2' },
      { flexWindow: '7', expected: true, description: 'Valid flexWindow: 7' },
      
      // Invalid cases
      { flexWindow: '3', expected: false, description: 'Invalid flexWindow: 3' },
      { flexWindow: '5', expected: false, description: 'Invalid flexWindow: 5' },
      { flexWindow: 0, expected: false, description: 'Invalid flexWindow: number instead of string' },
      { flexWindow: '10', expected: false, description: 'Invalid flexWindow: 10' },
      { flexWindow: '', expected: false, description: 'Empty flexWindow' },
      { flexWindow: null, expected: false, description: 'Null flexWindow' },
      { flexWindow: undefined, expected: false, description: 'Undefined flexWindow' }
    ];

    testCases.forEach(testCase => {
      const params = {
        flexWindow: testCase.flexWindow,
        checkIn: '2025-08-25',
        checkOut: '2025-08-28',
        search: 'Test City',
        adults: 2,
        children: 0,
        currency: 'EUR',
        rooms: 1
      };

      try {
        const result = validateScraperParameters('booking', params);
        const passed = testCase.expected === true;
        this.recordTest('flexWindow', testCase.description, passed, null);
      } catch (error) {
        const passed = testCase.expected === false;
        this.recordTest('flexWindow', testCase.description, passed, error.message);
      }
    });
  }

  // Test date validation
  testDateValidation() {
    console.log('📅 Testing date validation...');
    
    const testCases = [
      // Valid cases
      { checkIn: '2025-08-25', checkOut: '2025-08-28', expected: true, description: 'Valid ISO dates' },
      { checkIn: '2025-12-24', checkOut: '2025-12-31', expected: true, description: 'Valid future dates' },
      
      // Invalid format cases
      { checkIn: '25/08/2025', checkOut: '28/08/2025', expected: false, description: 'Invalid format: DD/MM/YYYY' },
      { checkIn: '2025-8-25', checkOut: '2025-8-28', expected: false, description: 'Invalid format: missing leading zeros' },
      { checkIn: 'Aug 25, 2025', checkOut: 'Aug 28, 2025', expected: false, description: 'Invalid format: text format' },
      
      // Invalid logic cases
      { checkIn: '2025-08-28', checkOut: '2025-08-25', expected: false, description: 'Invalid logic: checkOut before checkIn' },
      { checkIn: '2025-08-25', checkOut: '2025-08-25', expected: false, description: 'Invalid logic: same dates' },
      { checkIn: '2024-01-01', checkOut: '2024-01-05', expected: false, description: 'Invalid logic: past dates' }
    ];

    testCases.forEach(testCase => {
      const params = {
        flexWindow: '0',
        checkIn: testCase.checkIn,
        checkOut: testCase.checkOut,
        search: 'Test City',
        adults: 2,
        children: 0,
        currency: 'EUR',
        rooms: 1
      };

      try {
        const result = validateScraperParameters('booking', params);
        const passed = testCase.expected === true;
        this.recordTest('dateValidation', testCase.description, passed, null);
      } catch (error) {
        const passed = testCase.expected === false;
        this.recordTest('dateValidation', testCase.description, passed, error.message);
      }
    });
  }

  // Test URL cleaning functionality
  testUrlCleaning() {
    console.log('🔗 Testing URL cleaning...');
    
    const testCases = [
      {
        description: 'Booking.com URLs with query parameters',
        input: [
          { url: 'https://www.booking.com/hotel/ro/silva-sibiu.ro.html?checkin=2025-01-15&adults=2' },
          { url: 'https://www.booking.com/hotel/ro/another.html?rooms=1&currency=EUR' }
        ],
        expected: [
          { url: 'https://www.booking.com/hotel/ro/silva-sibiu.ro.html' },
          { url: 'https://www.booking.com/hotel/ro/another.html' }
        ]
      },
      {
        description: 'Airbnb URLs with query parameters',
        input: [
          { url: 'https://www.airbnb.com/rooms/49313162?check_in=2025-01-15&adults=2' },
          { url: 'https://www.airbnb.com/rooms/12345?guests=4&currency=USD' }
        ],
        expected: [
          { url: 'https://www.airbnb.com/rooms/49313162' },
          { url: 'https://www.airbnb.com/rooms/12345' }
        ]
      },
      {
        description: 'Mixed valid and invalid URLs',
        input: [
          { url: 'https://www.booking.com/hotel/valid.html?param=1' },
          { url: 'invalid-url' },
          { url: 'https://www.airbnb.com/rooms/123' }
        ],
        expected: [
          { url: 'https://www.booking.com/hotel/valid.html' },
          { url: 'https://www.airbnb.com/rooms/123' }
        ]
      }
    ];

    testCases.forEach(testCase => {
      try {
        const result = cleanUrlsForReviewScraper(testCase.input, 'booking');
        const passed = result.length === testCase.expected.length &&
                      result.every((item, i) => item.url === testCase.expected[i]?.url);
        this.recordTest('urlCleaning', testCase.description, passed, null);
        this.monitor.logUrlCleaning('booking', testCase.input, result);
      } catch (error) {
        this.recordTest('urlCleaning', testCase.description, false, error.message);
      }
    });
  }

  // Test price range validation
  testPriceRangeValidation() {
    console.log('💰 Testing price range validation...');
    
    const testCases = [
      { minMaxPrice: '50-200', expected: true, description: 'Valid price range format' },
      { minMaxPrice: '0-999999', expected: true, description: 'Wide price range' },
      { minMaxPrice: '100-100', expected: true, description: 'Same min and max price' },
      { minMaxPrice: '50', expected: false, description: 'Missing max price' },
      { minMaxPrice: 'cheap-expensive', expected: false, description: 'Non-numeric price range' },
      { minMaxPrice: '200-50', expected: true, description: 'Reversed range (should warn but not fail)' }
    ];

    testCases.forEach(testCase => {
      const params = {
        flexWindow: '0',
        checkIn: '2025-08-25',
        checkOut: '2025-08-28',
        search: 'Test City',
        minMaxPrice: testCase.minMaxPrice,
        adults: 2,
        children: 0,
        currency: 'EUR',
        rooms: 1
      };

      try {
        const result = validateScraperParameters('booking', params);
        this.recordTest('priceRange', testCase.description, testCase.expected, null);
      } catch (error) {
        this.recordTest('priceRange', testCase.description, !testCase.expected, error.message);
      }
    });
  }

  // Test property type validation
  testPropertyTypeValidation() {
    console.log('🏨 Testing property type validation...');
    
    const validTypes = [
      'Hotels', 'Apartments', 'Hostels', 'Guest Houses', 'Homestays',
      'Bed an breakfasts', 'Holiday homes', 'Boats', 'Villas', 'Motels',
      'Resorts', 'Holiday parks', 'Campsites', 'Luxury tents', 'none'
    ];

    const testCases = [
      ...validTypes.map(type => ({ propertyType: type, expected: true, description: `Valid property type: ${type}` })),
      { propertyType: 'Invalid Type', expected: true, description: 'Invalid property type (should warn but not fail)' },
      { propertyType: '', expected: true, description: 'Empty property type' },
      { propertyType: null, expected: true, description: 'Null property type' }
    ];

    testCases.forEach(testCase => {
      const params = {
        flexWindow: '0',
        checkIn: '2025-08-25',
        checkOut: '2025-08-28',
        search: 'Test City',
        propertyType: testCase.propertyType,
        adults: 2,
        children: 0,
        currency: 'EUR',
        rooms: 1
      };

      try {
        const result = validateScraperParameters('booking', params);
        this.recordTest('propertyType', testCase.description, testCase.expected, null);
      } catch (error) {
        this.recordTest('propertyType', testCase.description, !testCase.expected, error.message);
      }
    });
  }

  // Test Airbnb-specific validation
  testAirbnbSpecificValidation() {
    console.log('🏠 Testing Airbnb-specific validation...');
    
    const testCases = [
      {
        params: {
          adults: 2,
          children: 0,
          checkIn: '2025-08-25',
          checkOut: '2025-08-28',
          locationQueries: ['Test City'],
          priceMin: 50,
          priceMax: 200,
          currency: 'EUR',
          locale: 'ro-RO'
        },
        expected: true,
        description: 'Valid Airbnb parameters'
      },
      {
        params: {
          adults: 2,
          children: 0,
          checkIn: '2025-08-25',
          checkOut: '2025-08-28',
          locationQueries: [],
          priceMin: 50,
          priceMax: 200
        },
        expected: false,
        description: 'Empty locationQueries array'
      },
      {
        params: {
          adults: 2,
          children: 0,
          checkIn: '2025-08-25',
          checkOut: '2025-08-28',
          locationQueries: ['Test City'],
          priceMin: 200,
          priceMax: 50
        },
        expected: false,
        description: 'priceMin greater than priceMax'
      }
    ];

    testCases.forEach(testCase => {
      try {
        const result = validateScraperParameters('airbnb', testCase.params);
        this.recordTest('airbnbValidation', testCase.description, testCase.expected, null);
      } catch (error) {
        this.recordTest('airbnbValidation', testCase.description, !testCase.expected, error.message);
      }
    });
  }

  // Test edge cases and boundary conditions
  testEdgeCases() {
    console.log('⚠️ Testing edge cases...');
    
    const edgeCases = [
      {
        description: 'Extreme adult count',
        params: { adults: 25, flexWindow: '0', checkIn: '2025-08-25', checkOut: '2025-08-28', search: 'Test' },
        shouldWarn: true
      },
      {
        description: 'Negative children count',
        params: { children: -1, flexWindow: '0', checkIn: '2025-08-25', checkOut: '2025-08-28', search: 'Test', adults: 2 },
        shouldWarn: true
      },
      {
        description: 'Very long destination name',
        params: { search: 'A'.repeat(200), flexWindow: '0', checkIn: '2025-08-25', checkOut: '2025-08-28', adults: 2 },
        shouldPass: true
      },
      {
        description: 'Special characters in destination',
        params: { search: 'Brașov & Sighetul Marmației', flexWindow: '0', checkIn: '2025-08-25', checkOut: '2025-08-28', adults: 2 },
        shouldPass: true
      }
    ];

    edgeCases.forEach(testCase => {
      try {
        const result = validateScraperParameters('booking', testCase.params);
        this.recordTest('edgeCases', testCase.description, testCase.shouldPass !== false, null);
      } catch (error) {
        this.recordTest('edgeCases', testCase.description, testCase.shouldPass === false, error.message);
      }
    });
  }

  // Record test result
  recordTest(category, description, passed, errorMessage) {
    const result = {
      category,
      description,
      passed,
      errorMessage,
      timestamp: new Date().toISOString()
    };

    this.testResults.push(result);
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status}: ${description}`);
    if (errorMessage && !passed) {
      console.log(`    Error: ${errorMessage}`);
    }
  }

  // Generate comprehensive test report
  generateTestReport() {
    console.log('\n📊 Test Report Summary\n');

    const categories = [...new Set(this.testResults.map(r => r.category))];
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);

    console.log('\nBy Category:');
    categories.forEach(category => {
      const categoryTests = this.testResults.filter(r => r.category === category);
      const categoryPassed = categoryTests.filter(r => r.passed).length;
      console.log(`  ${category}: ${categoryPassed}/${categoryTests.length} passed`);
    });

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(test => {
        console.log(`  - ${test.category}: ${test.description}`);
        console.log(`    Error: ${test.errorMessage}`);
      });
    }

    console.log('\n🎯 Recommendations:');
    if (this.testResults.filter(r => r.category === 'flexWindow' && !r.passed).length > 0) {
      console.log('  - Critical: Fix flexWindow validation in AI prompt');
    }
    if (this.testResults.filter(r => r.category === 'dateValidation' && !r.passed).length > 0) {
      console.log('  - Important: Strengthen date format validation');
    }
    if (this.testResults.filter(r => r.category === 'urlCleaning' && !r.passed).length > 0) {
      console.log('  - Review: URL cleaning logic needs improvement');
    }

    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: (passedTests/totalTests)*100
      },
      categories: categories.map(cat => ({
        name: cat,
        tests: this.testResults.filter(r => r.category === cat)
      })),
      failedTests: this.testResults.filter(r => !r.passed),
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);

    if (failedTests.some(t => t.category === 'flexWindow')) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'flexWindow validation failures',
        action: 'Update system prompt with explicit flexWindow value requirements'
      });
    }

    if (failedTests.some(t => t.category === 'dateValidation')) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Date validation failures',
        action: 'Strengthen $fromAI descriptions for date parameters'
      });
    }

    return recommendations;
  }
}

// Quick test function for N8N usage
function quickParameterTest(nodeType, params) {
  const testSuite = new ParameterTestSuite();
  
  try {
    const result = validateScraperParameters(nodeType, params);
    return { success: true, validatedParams: result };
  } catch (error) {
    return { success: false, error: error.message, params };
  }
}

// Export for usage
module.exports = {
  ParameterTestSuite,
  quickParameterTest
};

// Run tests if called directly
if (require.main === module) {
  const testSuite = new ParameterTestSuite();
  testSuite.runAllTests();
}