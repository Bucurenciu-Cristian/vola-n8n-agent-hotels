#!/usr/bin/env node

/**
 * Enhanced VolaBot Prompt Sync Tool
 * 
 * Synchronizes MAIN_PROMPT.md and IMAGE_PROMPT.md content into N8N workflow JSON.
 * Creates both stripped (for git) and full (for N8N) versions of the workflow.
 * 
 * Usage: node scripts/sync-prompt.js
 * Or: make sync
 */

const fs = require('fs');
const path = require('path');

// File paths
const MAIN_PROMPT_FILE = path.join(__dirname, '..', 'MAIN_PROMPT.md');
const IMAGE_PROMPT_FILE = path.join(__dirname, '..', 'IMAGE_PROMPT.md');
const WORKFLOW_TEMPLATE = path.join(__dirname, '..', 'Hotels-Agent-CRISTI.json');
const WORKFLOW_FULL = path.join(__dirname, '..', 'Hotels-Agent-CRISTI.full.json');
const BACKUP_DIR = path.join(__dirname, '..', 'archive', 'backups');

// Node identifiers
const MAIN_AI_AGENT_TYPE = '@n8n/n8n-nodes-langchain.agent';
const IMAGE_AI_AGENT_NAME = 'Image AI AGENT ANALYZER';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup(workflowPath, suffix = '') {
    if (!fs.existsSync(workflowPath)) {
        console.log(`ℹ️ No existing file to backup: ${path.basename(workflowPath)}`);
        return null;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basename = path.basename(workflowPath, '.json');
    const backupPath = path.join(BACKUP_DIR, `${basename}-backup-${timestamp}${suffix}.json`);
    
    try {
        fs.copyFileSync(workflowPath, backupPath);
        console.log(`✅ Backup created: ${path.basename(backupPath)}`);
        return backupPath;
    } catch (error) {
        console.error('❌ Failed to create backup:', error.message);
        process.exit(1);
    }
}

function readPromptFile(promptPath) {
    try {
        if (!fs.existsSync(promptPath)) {
            console.error(`❌ Prompt file not found: ${promptPath}`);
            process.exit(1);
        }
        
        const content = fs.readFileSync(promptPath, 'utf8');
        // Remove any markdown header indicators if present
        return content
            .replace(/^→START SYSTEM PROMPT\n?/, '')
            .replace(/\n?→END SYSTEM PROMPT$/, '')
            .trim();
    } catch (error) {
        console.error(`❌ Failed to read prompt file ${promptPath}: ${error.message}`);
        process.exit(1);
    }
}

function findNodeById(workflow, nodeId) {
    return workflow.nodes.find(node => node.id === nodeId);
}

function findNodeByType(workflow, nodeType) {
    return workflow.nodes.find(node => node.type === nodeType);
}

function findNodeByName(workflow, nodeName) {
    return workflow.nodes.find(node => node.name === nodeName);
}

function updateWorkflowPrompts(workflow, mainPrompt, imagePrompt) {
    const updates = [];
    
    // Find and update Main AI AGENT
    const mainAgent = findNodeByType(workflow, MAIN_AI_AGENT_TYPE);
    if (mainAgent) {
        if (!mainAgent.parameters) mainAgent.parameters = {};
        if (!mainAgent.parameters.options) mainAgent.parameters.options = {};
        
        mainAgent.parameters.options.systemMessage = mainPrompt;
        updates.push({
            node: mainAgent.name || 'Main AI AGENT',
            type: 'Main AI Agent',
            length: mainPrompt.length
        });
    } else {
        console.warn('⚠️ Main AI AGENT node not found');
    }
    
    // Find and update Image AI AGENT ANALYZER
    const imageAgent = findNodeByName(workflow, IMAGE_AI_AGENT_NAME);
    if (imageAgent) {
        if (!imageAgent.parameters) imageAgent.parameters = {};
        if (!imageAgent.parameters.options) imageAgent.parameters.options = {};
        
        imageAgent.parameters.options.systemMessage = imagePrompt;
        updates.push({
            node: imageAgent.name || 'Image AI AGENT ANALYZER',
            type: 'Image AI Agent',
            length: imagePrompt.length
        });
    } else {
        console.warn('⚠️ Image AI AGENT ANALYZER node not found');
    }
    
    return updates;
}

function createStrippedWorkflow(workflow) {
    // Create a deep copy of the workflow
    const stripped = JSON.parse(JSON.stringify(workflow));
    
    // Strip prompts from both agents
    const mainAgent = findNodeByType(stripped, MAIN_AI_AGENT_TYPE);
    if (mainAgent && mainAgent.parameters?.options) {
        mainAgent.parameters.options.systemMessage = '';
    }
    
    const imageAgent = findNodeByName(stripped, IMAGE_AI_AGENT_NAME);
    if (imageAgent && imageAgent.parameters?.options) {
        imageAgent.parameters.options.systemMessage = '';
    }
    
    return stripped;
}

function saveWorkflowFile(workflow, filePath, description) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
        console.log(`✅ ${description}: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Failed to save ${description}: ${error.message}`);
        process.exit(1);
    }
}

function validateFiles() {
    const missing = [];
    
    if (!fs.existsSync(MAIN_PROMPT_FILE)) {
        missing.push(`MAIN_PROMPT.md not found at: ${MAIN_PROMPT_FILE}`);
    }
    
    if (!fs.existsSync(IMAGE_PROMPT_FILE)) {
        missing.push(`IMAGE_PROMPT.md not found at: ${IMAGE_PROMPT_FILE}`);
    }
    
    if (!fs.existsSync(WORKFLOW_TEMPLATE)) {
        missing.push(`Hotels-Agent-CRISTI.json not found at: ${WORKFLOW_TEMPLATE}`);
    }
    
    if (missing.length > 0) {
        console.error('❌ Missing required files:');
        missing.forEach(msg => console.error(`   ${msg}`));
        process.exit(1);
    }
}

function main() {
    console.log('🚀 Enhanced VolaBot Prompt Sync Tool');
    console.log('=====================================');
    
    // Validate input files exist
    validateFiles();
    
    // Create backups of existing files
    createBackup(WORKFLOW_TEMPLATE, '-template');
    createBackup(WORKFLOW_FULL, '-full');
    
    // Read the prompt files
    console.log('📖 Reading prompt files...');
    const mainPrompt = readPromptFile(MAIN_PROMPT_FILE);
    const imagePrompt = readPromptFile(IMAGE_PROMPT_FILE);
    
    console.log(`   Main prompt: ${mainPrompt.length} characters`);
    console.log(`   Image prompt: ${imagePrompt.length} characters`);
    
    // Load the workflow template
    console.log('🔧 Loading workflow template...');
    let workflow;
    try {
        workflow = JSON.parse(fs.readFileSync(WORKFLOW_TEMPLATE, 'utf8'));
    } catch (error) {
        console.error(`❌ Failed to load workflow template: ${error.message}`);
        process.exit(1);
    }
    
    // Update workflow with prompts (for full version)
    console.log('🔧 Injecting prompts into workflow...');
    const updates = updateWorkflowPrompts(workflow, mainPrompt, imagePrompt);
    
    // Display update summary
    updates.forEach(update => {
        console.log(`   ✅ Updated ${update.type}: ${update.node} (${update.length} chars)`);
    });
    
    // Save the full version (with prompts)
    console.log('💾 Saving full workflow for N8N import...');
    saveWorkflowFile(workflow, WORKFLOW_FULL, 'Full workflow saved');
    
    // Create and save the stripped version (without prompts)
    console.log('💾 Saving stripped template for git...');
    const strippedWorkflow = createStrippedWorkflow(workflow);
    saveWorkflowFile(strippedWorkflow, WORKFLOW_TEMPLATE, 'Stripped template saved');
    
    console.log('');
    console.log('✨ Sync completed successfully!');
    console.log('');
    console.log('📋 Files created:');
    console.log(`   🔧 ${path.basename(WORKFLOW_TEMPLATE)} - Template (empty prompts, for git)`);
    console.log(`   📦 ${path.basename(WORKFLOW_FULL)} - Full workflow (with prompts, for N8N)`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: make validate');
    console.log(`2. Import ${path.basename(WORKFLOW_FULL)} into N8N GUI`);
    console.log('3. Test the workflow in N8N');
    console.log('4. Commit only the .md files and template .json to git');
}

// Export functions for testing
module.exports = {
    main,
    readPromptFile,
    updateWorkflowPrompts,
    createStrippedWorkflow,
    findNodeById,
    findNodeByType,
    findNodeByName
};

// Run the script if called directly
if (require.main === module) {
    main();
}