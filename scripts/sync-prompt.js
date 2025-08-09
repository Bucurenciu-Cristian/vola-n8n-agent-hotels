#!/usr/bin/env node

/**
 * VolaBot Prompt Sync Tool
 * 
 * Synchronizes MAIN_PROMPT.md content into Hotels-Agent-CRISTI.json
 * This ensures single source of truth for the system prompt.
 * 
 * Usage: node scripts/sync-prompt.js
 * Or: npm run sync-prompt
 */

const fs = require('fs');
const path = require('path');

// File paths
const PROMPT_FILE = path.join(__dirname, '..', 'MAIN_PROMPT.md');
const WORKFLOW_FILE = path.join(__dirname, '..', 'Hotels-Agent-CRISTI.json');
const BACKUP_DIR = path.join(__dirname, '..', 'archive', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup(workflowPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `Hotels-Agent-CRISTI-backup-${timestamp}.json`);
    
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
        const content = fs.readFileSync(promptPath, 'utf8');
        // Remove the markdown header indicators if present
        return content.replace(/^→START SYSTEM PROMPT\n?/, '').replace(/\n?→END SYSTEM PROMPT$/, '');
    } catch (error) {
        console.error(`❌ Failed to read prompt file: ${error.message}`);
        process.exit(1);
    }
}

function updateWorkflowFile(workflowPath, promptContent) {
    try {
        // Read the workflow JSON
        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
        
        // Find the AI Agent node (should be the one with systemMessage parameter)
        let agentNode = workflow.nodes.find(node => 
            node.type === '@n8n/n8n-nodes-langchain.agent' && 
            node.parameters?.options?.systemMessage
        );
        
        if (!agentNode) {
            console.error('❌ Could not find AI Agent node in workflow');
            process.exit(1);
        }
        
        // Update the system message
        const oldPrompt = agentNode.parameters.options.systemMessage;
        agentNode.parameters.options.systemMessage = promptContent;
        
        // Write the updated workflow back to file
        fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
        
        console.log(`✅ Updated AI Agent node: ${agentNode.name}`);
        console.log(`📊 Prompt length: ${promptContent.length} characters`);
        
        // Show a diff summary
        if (oldPrompt !== promptContent) {
            console.log('🔄 Prompt has been updated in workflow JSON');
        } else {
            console.log('ℹ️ No changes detected in prompt content');
        }
        
    } catch (error) {
        console.error(`❌ Failed to update workflow file: ${error.message}`);
        process.exit(1);
    }
}

function validateFiles() {
    if (!fs.existsSync(PROMPT_FILE)) {
        console.error(`❌ MAIN_PROMPT.md not found at: ${PROMPT_FILE}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(WORKFLOW_FILE)) {
        console.error(`❌ Hotels-Agent-CRISTI.json not found at: ${WORKFLOW_FILE}`);
        process.exit(1);
    }
}

function main() {
    console.log('🚀 VolaBot Prompt Sync Tool');
    console.log('================================');
    
    // Validate input files exist
    validateFiles();
    
    // Create backup of current workflow
    createBackup(WORKFLOW_FILE);
    
    // Read the prompt from MAIN_PROMPT.md
    console.log('📖 Reading prompt from MAIN_PROMPT.md...');
    const promptContent = readPromptFile(PROMPT_FILE);
    
    // Update the workflow JSON
    console.log('🔧 Updating Hotels-Agent-CRISTI.json...');
    updateWorkflowFile(WORKFLOW_FILE, promptContent);
    
    console.log('');
    console.log('✨ Sync completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run validate');
    console.log('2. Import Hotels-Agent-CRISTI.json into N8N');
    console.log('3. Test the workflow in N8N');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, readPromptFile, updateWorkflowFile };