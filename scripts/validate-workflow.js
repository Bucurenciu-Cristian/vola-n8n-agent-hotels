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

const TEMPLATE_FILE = path.join(__dirname, '..', 'Hotels-Agent-CRISTI.json');
const FULL_FILE = path.join(__dirname, '..', 'Hotels-Agent-CRISTI.full.json');

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
        'Scrape Google Maps'
    ],
    systemMessageRequired: true,
    minSystemMessageLength: 1000, // Minimum prompt length
    maxSystemMessageLength: 50000, // Maximum prompt length
};

function loadWorkflow(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Workflow file not found: ${filePath}`);
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Failed to load workflow: ${error.message}`);
        process.exit(1);
    }
}

function findMainAgent(workflow) {
    return workflow.nodes.find(node => node.type === '@n8n/n8n-nodes-langchain.agent');
}

function findImageAgent(workflow) {
    return workflow.nodes.find(node => node.name === 'Image AI AGENT ANALYZER');
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

function validateTemplateSystemMessages(workflow) {
    console.log('🔍 Validating template system messages (should be empty)...');
    
    const mainAgent = findMainAgent(workflow);
    const imageAgent = findImageAgent(workflow);
    
    if (!mainAgent) {
        console.error('❌ Main AI Agent node not found');
        return false;
    }
    
    if (!imageAgent) {
        console.error('❌ Image AI Agent node not found');
        return false;
    }
    
    // Check Main Agent - should be empty
    const mainSystemMessage = mainAgent.parameters?.options?.systemMessage || '';
    if (mainSystemMessage.trim() !== '') {
        console.error(`❌ Template Main Agent has populated systemMessage (${mainSystemMessage.length} chars) - should be empty`);
        return false;
    }
    
    // Check Image Agent - should be empty
    const imageSystemMessage = imageAgent.parameters?.options?.systemMessage || '';
    if (imageSystemMessage.trim() !== '') {
        console.error(`❌ Template Image Agent has populated systemMessage (${imageSystemMessage.length} chars) - should be empty`);
        return false;
    }
    
    console.log('✅ Template has empty system messages (ready for git)');
    return true;
}

function validateFullSystemMessages(workflow) {
    console.log('🔍 Validating full workflow system messages (should be populated)...');
    
    const mainAgent = findMainAgent(workflow);
    const imageAgent = findImageAgent(workflow);
    
    if (!mainAgent) {
        console.error('❌ Main AI Agent node not found');
        return false;
    }
    
    if (!imageAgent) {
        console.error('❌ Image AI Agent node not found');
        return false;
    }
    
    // Check Main Agent - should be populated (1000+ chars)
    const mainSystemMessage = mainAgent.parameters?.options?.systemMessage;
    if (!mainSystemMessage || mainSystemMessage.length < VALIDATION_RULES.minSystemMessageLength) {
        console.error(`❌ Main Agent systemMessage too short: ${mainSystemMessage?.length || 0} chars (min: ${VALIDATION_RULES.minSystemMessageLength})`);
        return false;
    }
    
    if (mainSystemMessage.length > VALIDATION_RULES.maxSystemMessageLength) {
        console.error(`❌ Main Agent systemMessage too long: ${mainSystemMessage.length} chars (max: ${VALIDATION_RULES.maxSystemMessageLength})`);
        return false;
    }
    
    // Check Image Agent - should be populated (500+ chars minimum)
    const imageSystemMessage = imageAgent.parameters?.options?.systemMessage;
    if (!imageSystemMessage || imageSystemMessage.length < 500) {
        console.error(`❌ Image Agent systemMessage too short: ${imageSystemMessage?.length || 0} chars (min: 500)`);
        return false;
    }
    
    // Check for required sections in Main Agent
    const requiredSections = [
        'VolaBot',
        'Language Consistency Rule',
        'Conversation flow',
        'Multi-Platform Search Execution',
        'Final List Curation Algorithm'
    ];
    
    const missingSections = requiredSections.filter(section => 
        !mainSystemMessage.includes(section)
    );
    
    if (missingSections.length > 0) {
        console.warn(`⚠️ Missing recommended sections in Main Agent: ${missingSections.join(', ')}`);
    }
    
    console.log(`✅ Full workflow has populated system messages:`);
    console.log(`   • Main Agent: ${mainSystemMessage.length} characters`);
    console.log(`   • Image Agent: ${imageSystemMessage.length} characters`);
    return true;
}

function detectExposedSecrets(workflow) {
    console.log('🔒 Detecting exposed API keys and secrets...');

    const secretPatterns = [
        { pattern: /apify_api_[A-Za-z0-9]{20,}/g, name: 'Apify API Key' },
        { pattern: /token=[A-Za-z0-9_]{20,}(?!REDACTED)/g, name: 'API Token in URL' },
        { pattern: /api[_-]?key["\s:=]+[A-Za-z0-9_]{15,}/gi, name: 'Generic API Key' },
        { pattern: /sk-[A-Za-z0-9]{20,}/g, name: 'OpenAI API Key' },
        { pattern: /pk-[A-Za-z0-9]{20,}/g, name: 'Public API Key' }
    ];

    let exposedSecrets = [];

    // Convert workflow to string for pattern matching
    const workflowString = JSON.stringify(workflow, null, 2);

    for (const { pattern, name } of secretPatterns) {
        const matches = workflowString.match(pattern);
        if (matches) {
            exposedSecrets.push({
                type: name,
                count: matches.length,
                samples: matches.slice(0, 2) // Show first 2 matches as examples
            });
        }
    }

    // Check specific node parameters for exposed secrets
    const httpNodes = workflow.nodes.filter(node =>
        node.type === 'n8n-nodes-base.httpRequestTool'
    );

    for (const node of httpNodes) {
        const url = node.parameters?.url;
        if (url && url.includes('token=') && !url.includes('REDACTED')) {
            exposedSecrets.push({
                type: 'Token in URL',
                node: node.name,
                url: url.substring(0, 100) + '...' // Truncate for security
            });
        }
    }

    if (exposedSecrets.length > 0) {
        console.error('❌ EXPOSED SECRETS DETECTED:');
        for (const secret of exposedSecrets) {
            if (secret.node) {
                console.error(`   • ${secret.type} in node "${secret.node}"`);
            } else {
                console.error(`   • ${secret.type}: ${secret.count} occurrence(s) found`);
                if (secret.samples) {
                    console.error(`     Examples: ${secret.samples.map(s => s.substring(0, 20) + '***').join(', ')}`);
                }
            }
        }
        console.error('');
        console.error('🚨 SECURITY RISK: Workflow contains exposed API keys!');
        console.error('   Please use N8N credentials instead of hardcoded tokens.');
        return false;
    }

    console.log('✅ No exposed secrets detected');
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

        // Check for proper credential usage
        if (!node.credentials) {
            console.warn(`⚠️ No credentials configured for ${node.name} - using hardcoded authentication`);
        } else {
            console.log(`✅ ${node.name} uses N8N credentials: ${Object.keys(node.credentials).join(', ')}`);
        }

        // Check for authentication parameter
        if (!node.parameters?.authentication && !node.credentials) {
            console.warn(`⚠️ No authentication method configured for ${node.name}`);
        }
    }

    if (valid) {
        console.log(`✅ API configuration valid for ${httpNodes.length} tools`);
    }

    return valid;
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
    
    console.log('📄 Validating Template File (Hotels-Agent-CRISTI.json)');
    console.log('=======================================================');
    
    const templateWorkflow = loadWorkflow(TEMPLATE_FILE);
    
    const templateValidations = [
        validateWorkflowStructure(templateWorkflow),
        validateNodeTypes(templateWorkflow),
        validateTools(templateWorkflow),
        detectExposedSecrets(templateWorkflow),
        validateApiConfiguration(templateWorkflow),
        validateTemplateSystemMessages(templateWorkflow),
    ];
    
    const templatePassed = templateValidations.filter(Boolean).length;
    const templateTotal = templateValidations.length;
    
    console.log(`📋 Template Validation Results: ${templatePassed}/${templateTotal} passed`);
    
    // Only validate full file if template passes
    let fullPassed = 0;
    let fullTotal = 0;
    let fullWorkflow = null;
    
    if (templatePassed === templateTotal) {
        console.log('Validating Full File (Hotels-Agent-CRISTI.full.json)');
        console.log('====================================================');
        
        if (!fs.existsSync(FULL_FILE)) {
            console.warn('⚠️ Full workflow file not found - run "make sync" to generate it');
        } else {
            fullWorkflow = loadWorkflow(FULL_FILE);
            
            const fullValidations = [
                validateWorkflowStructure(fullWorkflow),
                detectExposedSecrets(fullWorkflow),
                validateFullSystemMessages(fullWorkflow),
            ];
            
            fullPassed = fullValidations.filter(Boolean).length;
            fullTotal = fullValidations.length;
            
            console.log(`📋 Full File Validation Results: ${fullPassed}/${fullTotal} passed`);
        }
    }
    
    console.log('🎯 Overall Validation Summary');
    console.log('=============================');
    
    if (templatePassed === templateTotal) {
        console.log('✅ Template validation: PASSED');
        if (fs.existsSync(FULL_FILE)) {
            if (fullPassed === fullTotal) {
                console.log('✅ Full file validation: PASSED');
                console.log('🚀 Both workflows ready!');
                console.log('  • Template: Ready for git commits');
                console.log('  • Full: Ready for N8N import');
                generateReport(templateWorkflow);
                process.exit(0);
            } else {
                console.log('❌ Full file validation: FAILED');
                process.exit(1);
            }
        } else {
            console.log('⚠️  Full file: Not found (run "make sync")');
            console.log('✅ Template validation passed - ready for development');
            generateReport(templateWorkflow);
            process.exit(0);
        }
    } else {
        console.log('❌ Template validation: FAILED');
        console.log('❌ Please fix template issues before proceeding');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, loadWorkflow, validateNodeTypes, validateTools, validateTemplateSystemMessages, validateFullSystemMessages, detectExposedSecrets, validateApiConfiguration, findMainAgent, findImageAgent };