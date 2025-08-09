# VolaBot Development Guide

> **Complete development workflow and best practices for maintaining the VolaBot N8N workflow**

This guide covers the day-to-day development workflow, troubleshooting, and best practices for working with the VolaBot project.

## 📋 Table of Contents

1. [Quick Start Workflow](#quick-start-workflow)
2. [Development Environment](#development-environment)
3. [Making Changes](#making-changes)
4. [Testing Strategy](#testing-strategy)
5. [Deployment Process](#deployment-process)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Advanced Usage](#advanced-usage)

## 🚀 Quick Start Workflow

The most common development tasks and their commands:

### Daily Development Cycle

```bash
# 1. Make your changes to the system prompt
nano MAIN_PROMPT.md

# 2. Sync changes to the N8N workflow JSON
npm run sync-prompt

# 3. Validate the workflow structure
npm run validate

# 4. Create a backup before deployment
npm run backup

# 5. Import Hotels-Agent-CRISTI.json into N8N Railway instance
# 6. Test the workflow via chat interface
```

### Emergency Fixes

```bash
# Quick validation and prep for emergency deployment
npm run deploy-prep
```

### First Time Setup

```bash
# Complete project setup from scratch
npm run setup
```

## 🛠️ Development Environment

### Required Tools

- **Node.js 14+**: For running automation scripts
- **Text Editor**: For editing MAIN_PROMPT.md (VS Code, nano, vim)
- **Web Browser**: For N8N GUI access on Railway
- **Git**: For version control and collaboration

### Environment Configuration

No local environment variables needed - all configuration happens in:
- **MAIN_PROMPT.md**: System prompt content
- **Hotels-Agent-CRISTI.json**: N8N workflow configuration
- **N8N Credentials**: API keys and database connections (Railway hosted)

### Project Structure Understanding

```
📁 Primary Files (edit these)
├── MAIN_PROMPT.md           # ✏️ Edit this for AI behavior changes
├── Hotels-Agent-CRISTI.json # 🔄 Auto-updated by sync-prompt script

📁 Automation Scripts (use these)
├── scripts/
│   ├── sync-prompt.js       # 🔄 Updates JSON from MAIN_PROMPT.md  
│   ├── validate-workflow.js # ✅ Validates workflow structure
│   └── organize-test-data.js # 📁 Organizes test files

📁 Documentation (reference these)
├── config/                  # ⚙️ Configuration guides
├── docs/                    # 📚 Technical documentation  
└── test-data/               # 🧪 Testing examples and API responses
```

## ✏️ Making Changes

### System Prompt Changes

The most common type of change - modifying VolaBot's behavior:

1. **Edit the Source**:
   ```bash
   nano MAIN_PROMPT.md
   ```

2. **Key Sections to Modify**:
   - **Conversation flow**: User interaction patterns
   - **Curation Algorithm**: Property selection logic
   - **Writing Style**: VolaBot's personality and voice
   - **Output Format**: Response structure and templates

3. **Sync Changes**:
   ```bash
   npm run sync-prompt
   ```

4. **Validate**:
   ```bash
   npm run validate
   ```

### Configuration Changes

For parameter adjustments, API settings, or node configuration:

1. **Edit JSON Directly** (for non-prompt changes):
   ```bash
   nano Hotels-Agent-CRISTI.json
   ```

2. **Common Configuration Areas**:
   - **API URLs**: Apify scraper endpoints
   - **Parameters**: Default values, limits, timeouts
   - **Credentials**: Reference names (not actual values)
   - **Node Settings**: Tool configurations

3. **Validate Changes**:
   ```bash
   npm run validate
   ```

### Adding New Features

For major changes requiring new nodes or tools:

1. **Plan the Change**:
   - Document the feature requirements
   - Identify affected nodes and connections
   - Plan testing strategy

2. **Implement in N8N GUI**:
   - Make changes directly in Railway N8N instance
   - Test the workflow thoroughly

3. **Export and Sync**:
   - Export workflow from N8N as JSON
   - Replace `Hotels-Agent-CRISTI.json` with exported version
   - Run `npm run validate` to ensure structure integrity

4. **Document Changes**:
   - Update relevant documentation
   - Add test cases to `test-data/`

## 🧪 Testing Strategy

### Local Testing (Pre-Deployment)

```bash
# Validate workflow structure
npm run validate

# Check for common issues
npm run sync-prompt && npm run validate
```

**What gets validated**:
- ✅ Required node types present
- ✅ Scraper tools configured correctly
- ✅ System message within length limits
- ✅ API URLs and authentication setup
- ✅ No duplicate node IDs

### N8N Testing (Post-Deployment)

1. **Chat Interface Test**:
   - Open N8N chat interface
   - Test with standard query: "Looking for hotels in Paris for 3 days next week"
   - Verify response format and quality

2. **Parameter Extraction Test**:
   - Check console logs for correct parameter parsing
   - Verify date handling and flexibility_window settings
   - Confirm language detection and consistency

3. **Scraper Tool Test**:
   - Monitor tool execution time (~5 minutes expected)
   - Verify all three scrapers (Booking, Airbnb, Google Maps) execute
   - Check API response structure and data quality

4. **Response Quality Test**:
   - Confirm exactly 7 properties returned
   - Verify 5-2 platform ratio maintained
   - Check review analysis depth and accuracy
   - Validate link integrity and image selection

### Test Data Usage

Use `test-data/` directory for consistent testing:

- **`sample-requests/`**: Test various user input patterns
- **`api-responses/`**: Compare current responses with historical examples
- **`Testing.http`**: Manual API endpoint testing

## 🚢 Deployment Process

### Pre-Deployment Checklist

```bash
# Run full validation
npm run deploy-prep
```

**Manual Checklist**:
- [ ] `npm run validate` passes without errors
- [ ] System prompt length appropriate (>1000, <50000 chars)
- [ ] All required sections present in prompt
- [ ] Backup created automatically
- [ ] Test cases documented for new features

### Railway N8N Deployment

1. **Prepare Locally**:
   ```bash
   npm run backup        # Create backup
   npm run deploy-prep   # Validate everything
   ```

2. **Deploy to N8N**:
   - Access Railway N8N instance
   - Go to Workflows → Import
   - Upload `Hotels-Agent-CRISTI.json`
   - Resolve any credential references
   - Activate the workflow

3. **Post-Deployment Validation**:
   - Test chat interface functionality
   - Verify webhook endpoints responding
   - Check database connection (PostgreSQL chat memory)
   - Run end-to-end test with real query

### Rollback Strategy

If deployment fails:

1. **Immediate Rollback**:
   - Import previous backup from `archive/backups/`
   - Activate the previous working workflow

2. **Identify Issue**:
   - Check N8N error logs
   - Run `npm run validate` on problematic JSON
   - Compare with last working version

3. **Fix and Redeploy**:
   - Fix issues locally
   - Re-run validation
   - Deploy corrected version

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Validation Failures

**Problem**: `npm run validate` fails
```
❌ System message too short: 500 chars (min: 1000)
```

**Solutions**:
- Check `MAIN_PROMPT.md` content completeness
- Run `npm run sync-prompt` to sync changes
- Verify no corruption in MAIN_PROMPT.md file

#### 2. N8N Import Failures

**Problem**: JSON import fails in N8N GUI

**Solutions**:
- Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('Hotels-Agent-CRISTI.json'))"`
- Check for missing credentials references
- Verify node ID uniqueness
- Compare with backup version structure

#### 3. Scraper Tool Failures

**Problem**: API tools fail during execution

**Solutions**:
- Verify Apify API credentials in N8N
- Check API endpoint URLs in JSON
- Validate parameter formats (dates, flexibility_window)
- Review API rate limits and quotas

#### 4. Response Quality Issues

**Problem**: VolaBot responses malformed or incomplete

**Solutions**:
- Check system prompt completeness in JSON
- Verify all required sections present
- Test parameter extraction logic
- Review API response examples in `test-data/`

### Debugging Workflow

1. **Local Validation**:
   ```bash
   npm run validate
   ```

2. **Check File Integrity**:
   ```bash
   # Verify MAIN_PROMPT.md content
   wc -l MAIN_PROMPT.md
   
   # Check JSON structure  
   node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('Hotels-Agent-CRISTI.json'))))"
   ```

3. **Compare with Working Version**:
   ```bash
   # Compare with backup
   diff Hotels-Agent-CRISTI.json archive/backups/Hotels-Agent-CRISTI-backup-*.json
   ```

4. **N8N Console Logs**:
   - Check N8N execution logs
   - Monitor API response formats
   - Verify parameter passing between nodes

## 📝 Best Practices

### Development Workflow

1. **Always Backup Before Changes**:
   ```bash
   npm run backup
   ```

2. **Single Source of Truth**:
   - Edit `MAIN_PROMPT.md` for AI behavior
   - Never edit system message in JSON directly
   - Always sync: `npm run sync-prompt`

3. **Validate Before Deployment**:
   ```bash
   npm run deploy-prep
   ```

4. **Test Incrementally**:
   - Make small, focused changes
   - Test each change individually
   - Document what worked/failed

### Code Quality

1. **Prompt Engineering**:
   - Keep instructions clear and specific
   - Use examples for complex logic
   - Maintain consistent tone and style
   - Document parameter requirements clearly

2. **Configuration Management**:
   - Use meaningful node names
   - Document complex parameter logic
   - Keep API endpoints up-to-date
   - Maintain credential references consistently

3. **Documentation**:
   - Update docs with each change
   - Include examples for new features
   - Document troubleshooting steps
   - Maintain change log for major updates

### Performance Optimization

1. **API Efficiency**:
   - Limit scraper results to necessary amounts
   - Use appropriate timeout values
   - Optimize parameter combinations
   - Monitor response times

2. **Response Quality**:
   - Maintain strict 7-property output
   - Enforce 5-2 platform ratio
   - Optimize image selection algorithm
   - Ensure review analysis depth

## 🔧 Advanced Usage

### Batch Operations

```bash
# Complete development cycle
npm run sync-prompt && npm run validate && npm run backup

# Organize and validate
npm run organize && npm run validate

# Emergency deployment prep
npm run backup && npm run deploy-prep
```

### Custom Scripts

You can extend the automation by creating custom scripts in `scripts/`:

```javascript
// Example: custom-validation.js
const { validateSystemMessage } = require('./validate-workflow');
const workflow = JSON.parse(require('fs').readFileSync('Hotels-Agent-CRISTI.json'));

// Custom validation logic
console.log('Running custom validation...');
validateSystemMessage(workflow);
```

### Integration with CI/CD

For automated deployments, you can integrate the scripts:

```yaml
# Example GitHub Action
- name: Validate Workflow
  run: npm run validate

- name: Deploy to N8N
  run: |
    npm run backup
    npm run deploy-prep
    # Custom N8N API deployment script
```

### Advanced Debugging

```bash
# Deep JSON analysis
node -e "
const workflow = JSON.parse(require('fs').readFileSync('Hotels-Agent-CRISTI.json'));
console.log('Nodes:', workflow.nodes.length);
console.log('Agent nodes:', workflow.nodes.filter(n => n.type.includes('agent')).length);
console.log('HTTP tools:', workflow.nodes.filter(n => n.type.includes('httpRequestTool')).length);
"

# Prompt length analysis
node -e "
const fs = require('fs');
const prompt = fs.readFileSync('MAIN_PROMPT.md', 'utf8');
console.log('Prompt length:', prompt.length);
console.log('Lines:', prompt.split('\n').length);
"
```

---

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. **Check Related Documentation**:
   - `README.md`: Project overview
   - `config/README.md`: Configuration guide
   - `test-data/README.md`: Testing guide

2. **Review Examples**:
   - `test-data/sample-requests/`: Request examples
   - `test-data/api-responses/`: Response examples
   - `archive/init/`: Original working versions

3. **Debugging Steps**:
   - Run `npm run validate`
   - Compare with backups
   - Check N8N console logs
   - Test with known-good examples

Remember: The goal is to maintain a clean, predictable workflow that eliminates the GUI clicking and file duplication issues while keeping the powerful VolaBot functionality intact.