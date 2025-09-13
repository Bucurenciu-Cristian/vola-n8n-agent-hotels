#!/usr/bin/env python3
"""
Update API limits in Hotels-Agent-CRISTI.json workflow file.
Modifies all 'limit' and 'maxItems' parameters in queryParameters sections.

Usage:
    python3 update-api-limits.py [new_limit_value]
    
Examples:
    python3 update-api-limits.py 10     # Set all limits to 10
    python3 update-api-limits.py        # Interactive mode
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

class APILimitUpdater:
    def __init__(self):
        self.workflow_file = "Hotels-Agent-CRISTI.json"
        self.backup_dir = Path("archive/backups")
        self.changes_made = []
        
    def validate_limit_value(self, value):
        """Validate the limit value is a positive integer"""
        try:
            limit = int(value)
            if limit <= 0:
                raise ValueError("Limit must be a positive integer")
            if limit > 1000:
                print(f"⚠️  Warning: Limit {limit} is very high - this may impact API costs")
                response = input("Continue? (y/N): ").lower()
                if response != 'y':
                    return None
            return str(limit)
        except ValueError:
            return None
    
    def create_backup(self):
        """Create timestamped backup of workflow file"""
        if not os.path.exists(self.workflow_file):
            print(f"❌ Workflow file {self.workflow_file} not found!")
            return False
            
        # Ensure backup directory exists
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Create timestamped backup filename
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        backup_file = self.backup_dir / f"Hotels-Agent-CRISTI-backup-{timestamp}.json"
        
        try:
            with open(self.workflow_file, 'r', encoding='utf-8') as src:
                content = src.read()
            with open(backup_file, 'w', encoding='utf-8') as dst:
                dst.write(content)
            
            print(f"💾 Backup created: {backup_file.name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create backup: {e}")
            return False
    
    def load_workflow(self):
        """Load and parse workflow JSON file"""
        try:
            with open(self.workflow_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in {self.workflow_file}: {e}")
            return None
        except FileNotFoundError:
            print(f"❌ File {self.workflow_file} not found!")
            return None
        except Exception as e:
            print(f"❌ Error reading {self.workflow_file}: {e}")
            return None
    
    def update_limits_in_node(self, node, node_id, new_limit):
        """Update limit and maxItems in a single node"""
        changes = []
        
        # Look for queryParameters in the node
        if 'parameters' in node and 'queryParameters' in node['parameters']:
            query_params = node['parameters']['queryParameters']
            if 'parameters' in query_params and isinstance(query_params['parameters'], list):
                for param in query_params['parameters']:
                    if isinstance(param, dict) and 'name' in param and 'value' in param:
                        param_name = param['name']
                        if param_name in ['limit', 'maxItems']:
                            old_value = param['value']
                            param['value'] = new_limit
                            changes.append({
                                'node_id': node_id,
                                'node_name': node.get('name', 'Unknown'),
                                'parameter': param_name,
                                'old_value': old_value,
                                'new_value': new_limit
                            })
        
        return changes
    
    def update_all_limits(self, workflow_data, new_limit):
        """Update all limit and maxItems parameters in the workflow"""
        total_changes = []
        
        if 'nodes' not in workflow_data:
            print("❌ No 'nodes' found in workflow data")
            return total_changes
        
        for node in workflow_data['nodes']:
            node_id = node.get('id', 'unknown')
            changes = self.update_limits_in_node(node, node_id, new_limit)
            total_changes.extend(changes)
        
        return total_changes
    
    def save_workflow(self, workflow_data):
        """Save updated workflow back to file"""
        try:
            with open(self.workflow_file, 'w', encoding='utf-8') as f:
                json.dump(workflow_data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"❌ Error saving {self.workflow_file}: {e}")
            return False
    
    def display_changes(self, changes):
        """Display summary of changes made"""
        if not changes:
            print("⚠️  No limit/maxItems parameters found to update")
            return
        
        print(f"\n📊 Updated {len(changes)} parameters:")
        print("=" * 60)
        
        # Group changes by node
        nodes = {}
        for change in changes:
            node_name = change['node_name']
            if node_name not in nodes:
                nodes[node_name] = []
            nodes[node_name].append(change)
        
        for node_name, node_changes in nodes.items():
            print(f"\n🔧 {node_name}")
            for change in node_changes:
                print(f"  • {change['parameter']}: {change['old_value']} → {change['new_value']}")
    
    def get_limit_value(self):
        """Get limit value from command line or user input"""
        if len(sys.argv) > 1:
            # Command line argument provided
            limit = self.validate_limit_value(sys.argv[1])
            if limit is None:
                print(f"❌ Invalid limit value: {sys.argv[1]}")
                print("   Limit must be a positive integer")
                return None
            return limit
        else:
            # Interactive mode
            print("🔧 API Limit Updater - Interactive Mode")
            print("=" * 40)
            while True:
                try:
                    user_input = input("Enter new limit value (or 'q' to quit): ").strip()
                    if user_input.lower() == 'q':
                        print("👋 Goodbye!")
                        return None
                    
                    limit = self.validate_limit_value(user_input)
                    if limit is not None:
                        return limit
                    else:
                        print("❌ Invalid value. Please enter a positive integer.")
                except KeyboardInterrupt:
                    print("\n👋 Goodbye!")
                    return None
    
    def run(self):
        """Main execution function"""
        print("🚀 VolaBot API Limit Updater")
        print("=" * 30)
        
        # Get the new limit value
        new_limit = self.get_limit_value()
        if new_limit is None:
            return False
        
        print(f"\n🎯 Target limit value: {new_limit}")
        
        # Create backup
        if not self.create_backup():
            return False
        
        # Load workflow
        workflow_data = self.load_workflow()
        if workflow_data is None:
            return False
        
        # Update limits
        changes = self.update_all_limits(workflow_data, new_limit)
        
        if not changes:
            print("⚠️  No changes needed - no limit/maxItems parameters found")
            return True
        
        # Save updated workflow
        if not self.save_workflow(workflow_data):
            return False
        
        # Display results
        self.display_changes(changes)
        
        print(f"\n✅ Successfully updated {len(changes)} API limit parameters!")
        print(f"📁 Updated file: {self.workflow_file}")
        print(f"💾 Backup available in: {self.backup_dir}/")
        
        return True

def main():
    """Main entry point"""
    updater = APILimitUpdater()
    success = updater.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()