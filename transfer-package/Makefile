# VolaBot Development Makefile
# Convenient command interface for N8N workflow development

# Project files
MAIN_PROMPT := MAIN_PROMPT.md
WORKFLOW_JSON := Hotels-Agent-CRISTI.json
SCRIPTS_DIR := scripts
BACKUP_DIR := archive/backups

# Default target
.DEFAULT_GOAL := help

.PHONY: help sync validate dev update-from-downloads integrate backup deploy organize update-limits-to-% update-charge-to-% clean setup test status update-limits update-charge-limits truncate

## Show this help message
help:
	@echo "🤖 VolaBot Development Commands"
	@echo "=============================="
	@echo ""
	@echo "⚡ Core Development:"
	@echo "  🔄 sync      - Enhanced sync: create template + full workflow"
	@echo "  ✅ validate  - Validate workflow structure"
	@echo "  🚀 dev       - Quick development cycle (sync + validate)"
	@echo "  🔄 update-from-downloads - Sync workflow from N8N GUI export"
	@echo "  🎯 integrate - Import GUI changes + sync prompts + validate"
	@echo ""
	@echo "📦 Workflow Generation:"
	@echo "  ✂️ strip     - Create clean template (empty prompts, for git)"
	@echo "  📤 export    - Generate full workflow (with prompts, for N8N)"
	@echo "  🎯 import-ready - Prepare workflow for N8N import"
	@echo ""
	@echo "🚢 Deployment:"
	@echo "  💾 backup    - Create timestamped backup"
	@echo "  🎯 deploy    - Full preparation for deployment"
	@echo ""
	@echo "📁 Project Management:"
	@echo "  📦 organize  - Organize test data files"
	@echo "  🛠️ setup     - Initial project setup"
	@echo "  🧹 clean     - Clean up temporary files"
	@echo ""
	@echo "🧪 Testing & Info:"
	@echo "  🔍 test      - Run validation and basic checks"
	@echo "  📊 status    - Show project status"
	@echo "  ❓ help      - Show this help message"
	@echo ""
	@echo "🔧 API Configuration:"
	@echo "  ⚙️ update-limits        - Update API limits (interactive)"
	@echo "  ⚙️ update-limits-to-X   - Set API limits to X (e.g., make update-limits-to-10)"
	@echo "  💰 update-charge-limits - Update API charge limits (interactive)"
	@echo "  💰 update-charge-to-X   - Set charge limits to $X (e.g., make update-charge-to-2.50)"
	@echo ""
	@echo "📝 Data Processing:"
	@echo "  ✂️ truncate             - Truncate JSON file (usage: make truncate FILE=path.json LIMIT=5)"
	@echo ""
	@echo "⭐ Quick Start:"
	@echo "  1. Edit $(MAIN_PROMPT) or IMAGE_PROMPT.md"
	@echo "  2. Run: make dev"
	@echo "  3. Import $(WORKFLOW_JSON).full to N8N"
	@echo ""

## Enhanced sync: Create both stripped template and full workflow with prompts
sync:
	@echo "🔄 Enhanced sync: processing both prompt files..."
	@if [ ! -f "$(MAIN_PROMPT)" ]; then \
		echo "❌ $(MAIN_PROMPT) not found!"; \
		exit 1; \
	fi
	@if [ ! -f "IMAGE_PROMPT.md" ]; then \
		echo "❌ IMAGE_PROMPT.md not found!"; \
		exit 1; \
	fi
	@node $(SCRIPTS_DIR)/sync-prompt.js
	@echo "✅ Enhanced sync completed"

## Create stripped template (empty prompts, for git commits)
strip:
	@echo "🔄 Creating stripped template for git..."
	@node $(SCRIPTS_DIR)/sync-prompt.js
	@echo "✅ Stripped template ready for git"

## Create full workflow for N8N import (alias for sync)
export: sync
	@echo "📦 Full workflow ready for N8N import: $(WORKFLOW_JSON).full"

## Alias for export with clear intent
import-ready: export
	@echo "🎯 Workflow prepared for N8N GUI import"

## Validate workflow structure and configuration
validate:
	@echo "🔍 Validating workflow..."
	@if [ ! -f "$(WORKFLOW_JSON)" ]; then \
		echo "❌ $(WORKFLOW_JSON) not found!"; \
		exit 1; \
	fi
	@node $(SCRIPTS_DIR)/validate-workflow.js
	@echo "✅ Validation completed"

## Quick development cycle: sync + validate
dev: sync validate
	@echo "✅ Development cycle complete!"
	@echo ""
	@echo "📋 Next steps:"
	@echo "1. Import $(WORKFLOW_JSON).full into N8N"
	@echo "2. Test the workflow in N8N interface"
	@echo "3. Commit only .md files and template .json to git"

## Sync workflow from N8N GUI export in Downloads
update-from-downloads:
	@echo "🔄 Looking for $(WORKFLOW_JSON) in Downloads..."
	@DOWNLOAD_FILE=$$(find ~/Downloads -name "$(WORKFLOW_JSON)" -type f -mtime -2 -name "*.json" 2>/dev/null | head -1); \
	if [ -z "$$DOWNLOAD_FILE" ]; then \
		echo "❌ No recent $(WORKFLOW_JSON) found in Downloads (last 2 days)"; \
		exit 1; \
	fi; \
	echo "📁 Found: $$DOWNLOAD_FILE"; \
	if [ ! -f "$(WORKFLOW_JSON)" ] || [ "$$DOWNLOAD_FILE" -nt "$(WORKFLOW_JSON)" ]; then \
		echo "💾 Creating backup before update..."; \
		mkdir -p $(BACKUP_DIR); \
		TIMESTAMP=$$(date +%Y%m%d-%H%M%S); \
		if [ -f "$(WORKFLOW_JSON)" ]; then \
			mv "$(WORKFLOW_JSON)" "$(BACKUP_DIR)/Hotels-Agent-CRISTI-backup-$$TIMESTAMP.json"; \
			echo "✅ Backup created: Hotels-Agent-CRISTI-backup-$$TIMESTAMP.json"; \
		fi; \
		mv "$$DOWNLOAD_FILE" "$(WORKFLOW_JSON)"; \
		echo "✅ Updated $(WORKFLOW_JSON) from Downloads"; \
		echo "📋 Next steps:"; \
		echo "1. Run: make validate"; \
		echo "2. Test the updated workflow"; \
	else \
		echo "⚠️ Downloads file is not newer than current file - no update needed"; \
	fi

## Full integration: import GUI changes, sync prompts, validate
integrate: update-from-downloads sync validate
	@echo "🎯 Full integration complete!"
	@echo ""
	@echo "✅ What just happened:"
	@echo "  1. Imported N8N GUI changes (with backup created)"
	@echo "  2. Synced your latest .md prompts to the workflow"  
	@echo "  3. Validated the integrated workflow"
	@echo ""
	@echo "📦 Ready to import: Hotels-Agent-CRISTI.full.json"
	@echo "🔄 Your GUI changes + prompt updates are now combined!"

## Create timestamped backup of workflow JSON
backup:
	@echo "💾 Creating backup..."
	@mkdir -p $(BACKUP_DIR)
	@TIMESTAMP=$$(date +%Y%m%d-%H%M%S); \
	cp $(WORKFLOW_JSON) $(BACKUP_DIR)/Hotels-Agent-CRISTI-backup-$$TIMESTAMP.json && \
	echo "✅ Backup created: Hotels-Agent-CRISTI-backup-$$TIMESTAMP.json"

## Full preparation for deployment
deploy: backup sync validate
	@echo "✅ Ready for N8N deployment!"
	@echo ""
	@echo "🚢 Deployment Steps:"
	@echo "1. Access Railway N8N instance"
	@echo "2. Import $(WORKFLOW_JSON)"
	@echo "3. Configure credentials if needed"
	@echo "4. Test the workflow"
	@echo ""
	@echo "🔄 Rollback available in: $(BACKUP_DIR)/"

## Organize scattered test data files
organize:
	@echo "📁 Organizing test data..."
	@node $(SCRIPTS_DIR)/organize-test-data.js
	@echo "✅ Organization completed"

## Clean up temporary files and caches
clean:
	@echo "🧹 Cleaning up..."
	@rm -rf node_modules/.cache 2>/dev/null || true
	@rm -f *.log 2>/dev/null || true
	@rm -f .DS_Store 2>/dev/null || true
	@find . -name "*.tmp" -delete 2>/dev/null || true
	@echo "✅ Cleanup completed"

## Initial project setup
setup:
	@echo "🚀 Setting up VolaBot project..."
	@echo "📦 Installing dependencies..."
	@npm install
	@echo "📁 Organizing test data..."
	@node $(SCRIPTS_DIR)/organize-test-data.js
	@echo "🔄 Syncing prompt..."
	@node $(SCRIPTS_DIR)/sync-prompt.js
	@echo "✅ Validating workflow..."
	@node $(SCRIPTS_DIR)/validate-workflow.js
	@echo "✅ Setup completed!"
	@echo ""
	@echo "🎉 Project ready! Next steps:"
	@echo "1. Configure N8N credentials"
	@echo "2. Import $(WORKFLOW_JSON) to N8N"
	@echo "3. Run: make help for available commands"

## Run validation and basic checks
test: validate
	@echo "🧪 Running additional tests..."
	@echo "📁 Checking file structure..."
	@[ -f "$(MAIN_PROMPT)" ] && echo "✅ $(MAIN_PROMPT) exists" || (echo "❌ $(MAIN_PROMPT) missing" && exit 1)
	@[ -f "$(WORKFLOW_JSON)" ] && echo "✅ $(WORKFLOW_JSON) exists" || (echo "❌ $(WORKFLOW_JSON) missing" && exit 1)
	@[ -d "$(SCRIPTS_DIR)" ] && echo "✅ Scripts directory exists" || (echo "❌ Scripts directory missing" && exit 1)
	@echo "🔧 Checking script permissions..."
	@[ -x "$(SCRIPTS_DIR)/sync-prompt.js" ] || chmod +x $(SCRIPTS_DIR)/sync-prompt.js
	@[ -x "$(SCRIPTS_DIR)/validate-workflow.js" ] || chmod +x $(SCRIPTS_DIR)/validate-workflow.js
	@[ -x "$(SCRIPTS_DIR)/organize-test-data.js" ] || chmod +x $(SCRIPTS_DIR)/organize-test-data.js
	@echo "✅ Script permissions OK"
	@echo "⚙️ Checking JSON syntax..."
	@node -e "JSON.parse(require('fs').readFileSync('$(WORKFLOW_JSON)'))" && echo "✅ JSON syntax valid" || (echo "❌ JSON syntax invalid" && exit 1)
	@echo "✅ All tests passed!"

## Show project status and info
status:
	@echo "📊 VolaBot Project Status"
	@echo "====================="
	@echo ""
	@echo "📄 Files:"
	@if [ -f "$(MAIN_PROMPT)" ]; then \
		PROMPT_SIZE=$$(wc -c < "$(MAIN_PROMPT)" | tr -d ' '); \
		PROMPT_LINES=$$(wc -l < "$(MAIN_PROMPT)" | tr -d ' '); \
		echo "  📝 $(MAIN_PROMPT): $$PROMPT_SIZE chars, $$PROMPT_LINES lines"; \
	else \
		echo "  ❌ $(MAIN_PROMPT): Missing"; \
	fi
	@if [ -f "$(WORKFLOW_JSON)" ]; then \
		JSON_SIZE=$$(wc -c < "$(WORKFLOW_JSON)" | tr -d ' '); \
		NODE_COUNT=$$(node -e "console.log(JSON.parse(require('fs').readFileSync('$(WORKFLOW_JSON)')).nodes.length)" 2>/dev/null || echo "?"); \
		echo "  🔧 $(WORKFLOW_JSON): $$JSON_SIZE chars, $$NODE_COUNT nodes"; \
	else \
		echo "  ❌ $(WORKFLOW_JSON): Missing"; \
	fi
	@echo ""
	@echo "$(YELLOW)Directory Structure:$(RESET)"
	@[ -d "scripts" ] && echo "  ✅ scripts/" || echo "  ❌ scripts/"
	@[ -d "config" ] && echo "  ✅ config/" || echo "  ❌ config/"
	@[ -d "test-data" ] && echo "  ✅ test-data/" || echo "  ❌ test-data/"
	@[ -d "docs" ] && echo "  ✅ docs/" || echo "  ❌ docs/"
	@[ -d "archive" ] && echo "  ✅ archive/" || echo "  ❌ archive/"
	@echo ""
	@echo "$(YELLOW)Backups:$(RESET)"
	@if [ -d "$(BACKUP_DIR)" ] && [ "$$(ls -A $(BACKUP_DIR) 2>/dev/null)" ]; then \
		BACKUP_COUNT=$$(ls -1 $(BACKUP_DIR)/*.json 2>/dev/null | wc -l | tr -d ' '); \
		LATEST_BACKUP=$$(ls -t $(BACKUP_DIR)/*.json 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "None"); \
		echo "  💾 $$BACKUP_COUNT backups available"; \
		echo "  📅 Latest: $$LATEST_BACKUP"; \
	else \
		echo "  ⚠️ No backups found"; \
	fi
	@echo ""
	@echo "$(YELLOW)Quick Actions:$(RESET)"
	@echo "  $(GREEN)make dev$(RESET)     - Sync and validate"
	@echo "  $(GREEN)make deploy$(RESET)  - Prepare for deployment"
	@echo "  $(GREEN)make help$(RESET)    - Show all commands"

# Advanced targets for power users

## Check for outdated backups (older than 30 days)
clean-backups:
	@echo "$(YELLOW)🧹 Cleaning old backups (>30 days)...$(RESET)"
	@if [ -d "$(BACKUP_DIR)" ]; then \
		find $(BACKUP_DIR) -name "*.json" -type f -mtime +30 -delete 2>/dev/null && \
		echo "$(GREEN)✅ Old backups cleaned$(RESET)" || \
		echo "$(BLUE)ℹ️ No old backups to clean$(RESET)"; \
	else \
		echo "$(BLUE)ℹ️ No backup directory found$(RESET)"; \
	fi

## Show diff between current and last backup
diff:
	@echo "$(YELLOW)📊 Comparing with latest backup...$(RESET)"
	@if [ -d "$(BACKUP_DIR)" ] && [ "$$(ls -A $(BACKUP_DIR) 2>/dev/null)" ]; then \
		LATEST_BACKUP=$$(ls -t $(BACKUP_DIR)/*.json 2>/dev/null | head -1); \
		if [ -f "$$LATEST_BACKUP" ]; then \
			echo "$(BLUE)Comparing $(WORKFLOW_JSON) with $$(basename $$LATEST_BACKUP)$(RESET)"; \
			diff "$$LATEST_BACKUP" "$(WORKFLOW_JSON)" || echo "$(GREEN)Files are identical$(RESET)"; \
		else \
			echo "$(RED)❌ No backup file found$(RESET)"; \
		fi \
	else \
		echo "$(RED)❌ No backups available for comparison$(RESET)"; \
	fi

## Show prompt statistics
prompt-stats:
	@echo "$(BLUE)📊 MAIN_PROMPT.md Statistics$(RESET)"
	@echo "============================="
	@if [ -f "$(MAIN_PROMPT)" ]; then \
		echo "Characters: $$(wc -c < $(MAIN_PROMPT))"; \
		echo "Lines: $$(wc -l < $(MAIN_PROMPT))"; \
		echo "Words: $$(wc -w < $(MAIN_PROMPT))"; \
		echo ""; \
		echo "$(YELLOW)Key Sections:$(RESET)"; \
		grep -c "##" $(MAIN_PROMPT) | awk '{print "  Main sections: " $$1}'; \
		grep -c "###" $(MAIN_PROMPT) | awk '{print "  Subsections: " $$1}'; \
		grep -c "VolaBot" $(MAIN_PROMPT) | awk '{print "  VolaBot mentions: " $$1}'; \
	else \
		echo "$(RED)❌ $(MAIN_PROMPT) not found$(RESET)"; \
	fi

## Update API limits in workflow (interactive)
update-limits:
	@echo "🔧 Updating API limits in workflow..."
	@python3 $(SCRIPTS_DIR)/update-api-limits.py

## Update API limits with specific value (pattern rule)
update-limits-to-%:
	@echo "🎯 Setting API limits to $*..."
	@python3 $(SCRIPTS_DIR)/update-api-limits.py $*

## Update API charge limits in workflow (interactive)
update-charge-limits:
	@echo "💰 Updating API charge limits in workflow..."
	@python3 $(SCRIPTS_DIR)/update-charge-limits.py

## Update API charge limits with specific value (pattern rule)
update-charge-to-%:
	@echo "💰 Setting API charge limits to $$$*..."
	@python3 $(SCRIPTS_DIR)/update-charge-limits.py $*

## Truncate JSON file to specified number of elements
truncate:
	@if [ -z "$(FILE)" ] || [ -z "$(LIMIT)" ]; then \
		echo "❌ Usage: make truncate FILE=path/to/file.json LIMIT=5"; \
		echo "📝 Example: make truncate FILE=apify/booking-scraper/dataset.json LIMIT=10"; \
		exit 1; \
	fi
	@echo "✂️ Truncating JSON file to $(LIMIT) elements..."
	@python3 $(SCRIPTS_DIR)/truncate-json.py "$(FILE)" "$(LIMIT)"

# Hidden targets (not shown in help)
.PHONY: clean-backups diff prompt-stats