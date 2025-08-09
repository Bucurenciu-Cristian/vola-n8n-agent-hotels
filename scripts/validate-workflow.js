#!/usr/bin/env node

/**
 * VolaBot Workflow Validator
 * 
 * Validates Hotels-Agent-CRISTI.json structure and configuration
 * before deployment to N8N on Railway.
 * 
 * Usage: node scripts/validate-workflow.js
 * Or: npm run validate
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_FILE = path.join(__dirname, '..', 'Hotels-Agent-CRISTI.json');

// Validation rules
const VALIDATION_RULES = {
    requiredNodes: [
        '@n8n/n8n-nodes-langchain.agent',
        '@n8n/n8n-nodes-langchain.chatTrigger',
        'n8n-nodes-base.httpRequestTool'
    ],
    requiredTools: [
        'Scrape AirBnb',
        'Scrape Booking',
        'Google Maps'
    ],
    systemMessageRequired: true,
    minSystemMessageLength: 1000, // Minimum prompt length
    maxSystemMessageLength: 50000, // Maximum prompt length
};

function loadWorkflow() {
    try {
        if (!fs.existsSync(WORKFLOW_FILE)) {
            throw new Error(`Workflow file not found: ${WORKFLOW_FILE}`);
        }
        
        const content = fs.readFileSync(WORKFLOW_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Failed to load workflow: ${error.message}`);
        process.exit(1);
    }
}

function validateNodeTypes(workflow) {
    console.log('🔍 Validating node types...');
    
    const nodeTypes = workflow.nodes.map(node => node.type);
    const missing = [];
    
    for (const required of VALIDATION_RULES.requiredNodes) {
        if (!nodeTypes.includes(required)) {
            missing.push(required);
        }
    }
    
    if (missing.length > 0) {
        console.error(`❌ Missing required node types: ${missing.join(', ')}`);
        return false;
    }
    
    console.log(`✅ All required node types present (${VALIDATION_RULES.requiredNodes.length})`);
    return true;
}

function validateTools(workflow) {
    console.log('🔍 Validating scraper tools...');
    
    const toolNodes = workflow.nodes.filter(node => 
        node.type === 'n8n-nodes-base.httpRequestTool'
    );
    
    const toolNames = toolNodes.map(node => node.name);
    const missing = [];
    
    for (const required of VALIDATION_RULES.requiredTools) {
        if (!toolNames.includes(required)) {
            missing.push(required);
        }
    }
    
    if (missing.length > 0) {
        console.error(`❌ Missing required tools: ${missing.join(', ')}`);
        return false;
    }
    
    console.log(`✅ All scraper tools present: ${toolNames.join(', ')}`);
    return true;
}

function validateSystemMessage(workflow) {
    console.log('🔍 Validating system message...');
    
    const agentNode = workflow.nodes.find(node => 
        node.type === '@n8n/n8n-nodes-langchain.agent'
    );
    
    if (!agentNode) {
        console.error('❌ AI Agent node not found');
        return false;
    }
    
    const systemMessage = agentNode.parameters?.options?.systemMessage;
    
    if (!systemMessage) {
        console.error('❌ System message not found in AI Agent node');
        return false;
    }
    
    const length = systemMessage.length;
    
    if (length < VALIDATION_RULES.minSystemMessageLength) {
        console.error(`❌ System message too short: ${length} chars (min: ${VALIDATION_RULES.minSystemMessageLength})`);
        return false;
    }
    
    if (length > VALIDATION_RULES.maxSystemMessageLength) {
        console.error(`❌ System message too long: ${length} chars (max: ${VALIDATION_RULES.maxSystemMessageLength})`);
        return false;
    }
    
    // Check for required sections
    const requiredSections = [
        'VolaBot',
        'Language Consistency Rule',
        'Conversation flow',
        'Multi-Platform Search Execution',
        'Final List Curation Algorithm'
    ];
    
    const missingSections = requiredSections.filter(section => 
        !systemMessage.includes(section)
    );
    
    if (missingSections.length > 0) {
        console.warn(`⚠️ Missing recommended sections: ${missingSections.join(', ')}`);
    }
    
    console.log(`✅ System message valid: ${length} characters`);
    return true;
}

function validateApiConfiguration(workflow) {
    console.log('🔍 Validating API configuration...');
    
    const httpNodes = workflow.nodes.filter(node => 
        node.type === 'n8n-nodes-base.httpRequestTool'
    );
    
    let valid = true;
    
    for (const node of httpNodes) {
        const url = node.parameters?.url;
        
        if (!url || !url.includes('api.apify.com')) {
            console.error(`❌ Invalid API URL in node ${node.name}: ${url}`);
            valid = false;
        }
        
        if (!node.parameters?.authentication) {
            console.warn(`⚠️ No authentication configured for ${node.name}`);
        }
    }
    
    if (valid) {
        console.log(`✅ API configuration valid for ${httpNodes.length} tools`);
    }
    
    return valid;
}

function validateSecurityCredentials(workflow) {
    console.log('🔍 Validating security credentials...');
    
    const workflowString = JSON.stringify(workflow);
    
    // Look for hardcoded Apify API keys in URLs
    const apifyTokenPattern = /\?token=apify_api_[A-Za-z0-9_]+/g;
    const matches = workflowString.match(apifyTokenPattern);
    
    if (matches) {
        // Filter out N8N variable references
        const hardcodedTokens = matches.filter(match => {
            // Check if this token is part of a variable reference
            const tokenIndex = workflowString.indexOf(match);
            const beforeToken = workflowString.substring(Math.max(0, tokenIndex - 50), tokenIndex);
            const afterToken = workflowString.substring(tokenIndex, tokenIndex + match.length + 50);
            
            // If it's wrapped in N8N variables {{ }} or is a credential reference, it's OK
            return !beforeToken.includes('{{') && !afterToken.includes('}}') && 
                   !beforeToken.includes('credential:');
        });
        
        if (hardcodedTokens.length > 0) {
            console.error('❌ Security issue found: Hardcoded Apify API keys detected!');
            console.error('');
            hardcodedTokens.forEach((token, index) => {
                const maskedToken = token.substring(0, 20) + '...';
                console.error(`  🚨 Hardcoded API key ${index + 1}: ${maskedToken}`);
            });
            console.error('');
            console.error('⚠️  CRITICAL: API keys should not be embedded directly in the workflow!');
            console.error('   Please use N8N credential management instead:');
            console.error('   1. Go to Settings > Credentials in N8N');
            console.error('   2. Create Apify API credentials');
            console.error('   3. Reference them in HTTP Request Tool authentication');
            console.error('   Guide: https://docs.n8n.io/credentials/');
            return false;
        }
    }
    
    console.log('✅ No hardcoded API keys detected');
    return true;
}

function validateWorkflowStructure(workflow) {
    console.log('🔍 Validating workflow structure...');
    
    // Check basic structure
    if (!workflow.name || !workflow.nodes || !Array.isArray(workflow.nodes)) {
        console.error('❌ Invalid workflow structure');
        return false;
    }
    
    if (workflow.nodes.length === 0) {
        console.error('❌ No nodes found in workflow');
        return false;
    }
    
    // Check for unique node IDs
    const nodeIds = workflow.nodes.map(node => node.id);
    const uniqueIds = [...new Set(nodeIds)];
    
    if (nodeIds.length !== uniqueIds.length) {
        console.error('❌ Duplicate node IDs found');
        return false;
    }
    
    console.log(`✅ Workflow structure valid: ${workflow.nodes.length} nodes`);
    return true;
}

function generateReport(workflow) {
    console.log('\n📊 Workflow Summary Report');
    console.log('==========================');
    console.log(`Workflow Name: ${workflow.name}`);
    console.log(`Total Nodes: ${workflow.nodes.length}`);
    
    const nodesByType = {};
    workflow.nodes.forEach(node => {
        nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    });
    
    console.log('\nNode Distribution:');
    Object.entries(nodesByType).forEach(([type, count]) => {
        const shortType = type.split('.').pop();
        console.log(`  • ${shortType}: ${count}`);
    });
    
    const agentNode = workflow.nodes.find(node => 
        node.type === '@n8n/n8n-nodes-langchain.agent'
    );
    
    if (agentNode?.parameters?.options?.systemMessage) {
        const promptLength = agentNode.parameters.options.systemMessage.length;
        console.log(`\nSystem Message: ${promptLength} characters`);
    }
}

function main() {
    console.log('🔍 VolaBot Workflow Validator');
    console.log('==============================');
    
    const workflow = loadWorkflow();
    
    const validations = [
        validateWorkflowStructure(workflow),
        validateNodeTypes(workflow),
        validateTools(workflow),
        validateSystemMessage(workflow),
        validateApiConfiguration(workflow),
        validateSecurityCredentials(workflow)
    ];
    
    const passed = validations.filter(Boolean).length;
    const total = validations.length;
    
    console.log(`\n📋 Validation Results: ${passed}/${total} passed`);
    
    if (passed === total) {
        console.log('✅ All validations passed! Workflow is ready for deployment.');
        generateReport(workflow);
        process.exit(0);
    } else {
        console.log('❌ Some validations failed. Please fix the issues before deployment.');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, loadWorkflow, validateNodeTypes, validateTools, validateSystemMessage, validateSecurityCredentials };