/**
 * Debug Monitoring System for N8N Apify Scrapers
 * Comprehensive logging and monitoring for parameter validation
 */

class ParameterMonitor {
  constructor(sessionId = 'unknown') {
    this.sessionId = sessionId;
    this.logs = [];
    this.startTime = Date.now();
  }

  // Log parameter validation events
  logValidation(nodeType, params, validation, aiResponse = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      nodeType,
      event: 'parameter_validation',
      parameters: this.sanitizeParams(params),
      validation: {
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        autoCorrections: validation.autoCorrections || [],
        status: validation.errors?.length > 0 ? 'ERROR' : 'OK'
      },
      aiResponse: aiResponse ? this.sanitizeAiResponse(aiResponse) : null,
      executionTime: Date.now() - this.startTime
    };

    this.logs.push(logEntry);
    console.log(`[PARAM MONITOR] ${nodeType}:`, JSON.stringify(logEntry, null, 2));
    
    return logEntry;
  }

  // Log API call results
  logApiCall(nodeType, params, response, executionTime) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      nodeType,
      event: 'api_call',
      parameters: this.sanitizeParams(params),
      response: {
        success: !response.error,
        itemCount: response.data ? response.data.length : 0,
        error: response.error || null,
        statusCode: response.statusCode,
        executionTime: executionTime
      },
      executionTime: Date.now() - this.startTime
    };

    this.logs.push(logEntry);
    console.log(`[API MONITOR] ${nodeType}:`, JSON.stringify(logEntry, null, 2));
    
    return logEntry;
  }

  // Log URL cleaning operations
  logUrlCleaning(nodeType, originalUrls, cleanedUrls) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      nodeType: `${nodeType}_url_cleaner`,
      event: 'url_cleaning',
      urlStats: {
        originalCount: originalUrls.length,
        cleanedCount: cleanedUrls.length,
        dropped: originalUrls.length - cleanedUrls.length,
        cleaningExamples: this.getCleaningExamples(originalUrls, cleanedUrls)
      },
      executionTime: Date.now() - this.startTime
    };

    this.logs.push(logEntry);
    console.log(`[URL MONITOR] ${nodeType}:`, JSON.stringify(logEntry, null, 2));
    
    return logEntry;
  }

  // Generate execution summary
  generateSummary() {
    const summary = {
      sessionId: this.sessionId,
      totalExecutionTime: Date.now() - this.startTime,
      events: this.logs.length,
      breakdown: {
        validations: this.logs.filter(l => l.event === 'parameter_validation').length,
        apiCalls: this.logs.filter(l => l.event === 'api_call').length,
        urlCleanings: this.logs.filter(l => l.event === 'url_cleaning').length
      },
      errors: this.logs.filter(l => l.validation?.status === 'ERROR' || l.response?.success === false),
      criticalIssues: this.identifyCriticalIssues(),
      recommendations: this.generateRecommendations()
    };

    console.log('[EXECUTION SUMMARY]:', JSON.stringify(summary, null, 2));
    return summary;
  }

  // Export logs for external analysis
  exportLogs(format = 'json') {
    switch (format) {
      case 'csv':
        return this.exportToCsv();
      case 'json':
      default:
        return JSON.stringify(this.logs, null, 2);
    }
  }

  // Private helper methods
  sanitizeParams(params) {
    const sanitized = { ...params };
    
    // Remove sensitive information if present
    delete sanitized.apiKey;
    delete sanitized.token;
    delete sanitized.credentials;
    
    return sanitized;
  }

  sanitizeAiResponse(response) {
    return {
      parametersExtracted: Object.keys(response).length,
      hasRequiredParams: ['checkIn', 'checkOut', 'search'].every(key => key in response),
      responseSize: JSON.stringify(response).length
    };
  }

  getCleaningExamples(original, cleaned) {
    const examples = [];
    for (let i = 0; i < Math.min(3, original.length); i++) {
      if (original[i] && cleaned[i]) {
        examples.push({
          original: original[i].url || original[i],
          cleaned: cleaned[i].url || cleaned[i]
        });
      }
    }
    return examples;
  }

  identifyCriticalIssues() {
    const issues = [];
    
    // Check for parameter validation failures
    const validationErrors = this.logs.filter(l => l.validation?.errors?.length > 0);
    if (validationErrors.length > 0) {
      issues.push({
        type: 'validation_failure',
        count: validationErrors.length,
        details: validationErrors.map(e => e.validation.errors).flat()
      });
    }

    // Check for API failures
    const apiErrors = this.logs.filter(l => l.response?.success === false);
    if (apiErrors.length > 0) {
      issues.push({
        type: 'api_failure',
        count: apiErrors.length,
        details: apiErrors.map(e => e.response.error)
      });
    }

    // Check for flexWindow issues specifically
    const flexWindowIssues = this.logs.filter(l => 
      l.validation?.errors?.some(err => err.includes('flexWindow'))
    );
    if (flexWindowIssues.length > 0) {
      issues.push({
        type: 'critical_flexwindow',
        count: flexWindowIssues.length,
        message: 'flexWindow parameter validation failures detected'
      });
    }

    return issues;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check parameter patterns
    const validationLogs = this.logs.filter(l => l.event === 'parameter_validation');
    
    if (validationLogs.some(l => l.validation.errors.some(e => e.includes('flexWindow')))) {
      recommendations.push({
        priority: 'HIGH',
        category: 'parameter_validation',
        issue: 'flexWindow validation failures',
        action: 'Update AI prompt to emphasize exact flexWindow values: "0", "1", "2", "7"'
      });
    }

    if (validationLogs.some(l => l.validation.errors.some(e => e.includes('date format')))) {
      recommendations.push({
        priority: 'HIGH',
        category: 'parameter_validation',
        issue: 'Date format validation failures',
        action: 'Strengthen date format instructions in $fromAI descriptions'
      });
    }

    // Check URL cleaning efficiency
    const urlLogs = this.logs.filter(l => l.event === 'url_cleaning');
    const avgDropRate = urlLogs.reduce((acc, log) => acc + (log.urlStats.dropped / log.urlStats.originalCount), 0) / urlLogs.length;
    
    if (avgDropRate > 0.1) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'url_cleaning',
        issue: `High URL drop rate: ${(avgDropRate * 100).toFixed(1)}%`,
        action: 'Review URL validation logic for property results'
      });
    }

    return recommendations;
  }

  exportToCsv() {
    const headers = ['timestamp', 'nodeType', 'event', 'status', 'errors', 'executionTime'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.nodeType,
      log.event,
      log.validation?.status || log.response?.success ? 'OK' : 'ERROR',
      log.validation?.errors?.join(';') || log.response?.error || '',
      log.executionTime
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// Factory function for N8N usage
function createParameterMonitor(sessionId) {
  return new ParameterMonitor(sessionId);
}

// Quick validation check function
function quickValidationCheck(nodeType, params) {
  const monitor = new ParameterMonitor('quick-check');
  
  const validation = { errors: [], warnings: [] };
  
  if (nodeType === 'booking') {
    // Critical checks only
    if (!['0', '1', '2', '7'].includes(params.flexWindow)) {
      validation.errors.push(`Invalid flexWindow: ${params.flexWindow}`);
    }
    if (!params.checkIn?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      validation.errors.push(`Invalid checkIn format: ${params.checkIn}`);
    }
    if (!params.checkOut?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      validation.errors.push(`Invalid checkOut format: ${params.checkOut}`);
    }
  }
  
  monitor.logValidation(nodeType, params, validation);
  
  return {
    isValid: validation.errors.length === 0,
    errors: validation.errors,
    monitor: monitor
  };
}

// Export for N8N usage
module.exports = {
  ParameterMonitor,
  createParameterMonitor,
  quickValidationCheck
};

// Example usage in N8N Code node:
/*
const { createParameterMonitor } = require('./debug-monitor.js');
const monitor = createParameterMonitor($('Edit Fields1').first().json.sessionId);

// Log validation
const validation = validateScraperParameters('booking', params);
monitor.logValidation('booking', params, validation);

// At end of workflow
const summary = monitor.generateSummary();
return [{ summary, logs: monitor.exportLogs('json') }];
*/