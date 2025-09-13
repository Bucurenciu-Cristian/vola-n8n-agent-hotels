#!/usr/bin/env python3
"""
Update API charge limits in Hotels-Agent-CRISTI.json workflow file.
Modifies all 'maxTotalChargeUsd' parameters in queryParameters sections.

Usage:
    python3 update-charge-limits.py [new_charge_limit]
    
Examples:
    python3 update-charge-limits.py 5.50    # Set all charge limits to $5.50
    python3 update-charge-limits.py 0.25    # Set all charge limits to $0.25
    python3 update-charge-limits.py         # Interactive mode
"""

import json
import sys
import os
import re
from datetime import datetime
from pathlib import Path

class ChargeUpdater:
    def __init__(self):
        self.workflow_file = "Hotels-Agent-CRISTI.json"
        self.backup_dir = Path("archive/backups")
        self.changes_made = []
        
    def validate_charge_value(self, value):
        """Validate the charge value is a positive number"""
        try:
            charge = float(value)
            if charge <= 0:
                raise ValueError("Charge limit must be a positive number")
            if charge > 100:
                print(f"⚠️  Warning: Charge limit ${charge:.2f} is very high - this could be expensive!")
                response = input("Continue? (y/N): ").lower()
                if response != 'y':
                    return None
            elif charge > 20:
                print(f"⚠️  Warning: Charge limit ${charge:.2f} is high - monitor costs carefully")
                response = input("Continue? (y/N): ").lower()
                if response != 'y':
                    return None
            return charge
        except ValueError:
            return None
    
    def parse_current_value(self, value_str):
        """Extract current dollar amount from N8N expression format"""
        # Match pattern: ={{ Number(X) }}
        match = re.search(r'Number\(([0-9.]+)\)', value_str)
        if match:
            return float(match.group(1))
        return None
    
    def format_charge_value(self, charge_amount):
        """Format charge amount as N8N expression"""
        return f"={{{{ Number({charge_amount}) }}}}"
    
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
    
    def update_charges_in_node(self, node, node_id, new_charge):
        """Update maxTotalChargeUsd in a single node"""
        changes = []
        
        # Look for queryParameters in the node
        if 'parameters' in node and 'queryParameters' in node['parameters']:
            query_params = node['parameters']['queryParameters']
            if 'parameters' in query_params and isinstance(query_params['parameters'], list):
                for param in query_params['parameters']:
                    if isinstance(param, dict) and 'name' in param and 'value' in param:
                        param_name = param['name']
                        if param_name == 'maxTotalChargeUsd':
                            old_value = param['value']
                            old_amount = self.parse_current_value(old_value)
                            new_value = self.format_charge_value(new_charge)
                            param['value'] = new_value
                            changes.append({
                                'node_id': node_id,
                                'node_name': node.get('name', 'Unknown'),
                                'parameter': param_name,
                                'old_value': old_value,
                                'old_amount': old_amount if old_amount else 'Unknown',
                                'new_value': new_value,
                                'new_amount': new_charge
                            })
        
        return changes
    
    def update_all_charges(self, workflow_data, new_charge):
        """Update all maxTotalChargeUsd parameters in the workflow"""
        total_changes = []
        
        if 'nodes' not in workflow_data:
            print("❌ No 'nodes' found in workflow data")
            return total_changes
        
        for node in workflow_data['nodes']:
            node_id = node.get('id', 'unknown')
            changes = self.update_charges_in_node(node, node_id, new_charge)
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
            print("⚠️  No maxTotalChargeUsd parameters found to update")
            return
        
        print(f"\n💰 Updated {len(changes)} charge limit parameters:")
        print("=" * 60)
        
        # Group changes by node
        nodes = {}
        for change in changes:
            node_name = change['node_name']
            if node_name not in nodes:
                nodes[node_name] = []
            nodes[node_name].append(change)
        
        total_old = 0
        total_new = 0
        
        for node_name, node_changes in nodes.items():
            print(f"\n🔧 {node_name}")
            for change in node_changes:
                old_amt = change['old_amount']
                new_amt = change['new_amount']
                if isinstance(old_amt, (int, float)):
                    print(f"  • {change['parameter']}: ${old_amt:.2f} → ${new_amt:.2f}")
                    total_old += old_amt
                    total_new += new_amt
                else:
                    print(f"  • {change['parameter']}: {old_amt} → ${new_amt:.2f}")
                    total_new += new_amt
        
        if total_old > 0:
            print(f"\n📊 Total API Budget: ${total_old:.2f} → ${total_new:.2f}")
            if total_new > total_old:
                print(f"   🔺 Increased by ${total_new - total_old:.2f}")
            elif total_new < total_old:
                print(f"   🔻 Decreased by ${total_old - total_new:.2f}")
        else:
            print(f"\n📊 Total API Budget: ${total_new:.2f}")
    
    def get_charge_value(self):
        """Get charge value from command line or user input"""
        if len(sys.argv) > 1:
            # Command line argument provided
            charge = self.validate_charge_value(sys.argv[1])
            if charge is None:
                print(f"❌ Invalid charge value: {sys.argv[1]}")
                print("   Charge limit must be a positive number")
                return None
            return charge
        else:
            # Interactive mode
            print("💰 API Charge Limit Updater - Interactive Mode")
            print("=" * 45)
            print("💡 Current limits are typically $1.00 per API")
            print("💡 Suggested values: 0.25, 0.50, 1.00, 2.00, 5.00")
            print("")
            while True:
                try:
                    user_input = input("Enter new charge limit in USD (or 'q' to quit): $").strip()
                    if user_input.lower() == 'q':
                        print("👋 Goodbye!")
                        return None
                    
                    charge = self.validate_charge_value(user_input)
                    if charge is not None:
                        return charge
                    else:
                        print("❌ Invalid value. Please enter a positive number.")
                except KeyboardInterrupt:
                    print("\n👋 Goodbye!")
                    return None
    
    def run(self):
        """Main execution function"""
        print("🚀 VolaBot API Charge Limit Updater")
        print("=" * 35)
        
        # Get the new charge value
        new_charge = self.get_charge_value()
        if new_charge is None:
            return False
        
        print(f"\n💰 Target charge limit: ${new_charge:.2f}")
        
        # Create backup
        if not self.create_backup():
            return False
        
        # Load workflow
        workflow_data = self.load_workflow()
        if workflow_data is None:
            return False
        
        # Update charge limits
        changes = self.update_all_charges(workflow_data, new_charge)
        
        if not changes:
            print("⚠️  No changes needed - no maxTotalChargeUsd parameters found")
            return True
        
        # Save updated workflow
        if not self.save_workflow(workflow_data):
            return False
        
        # Display results
        self.display_changes(changes)
        
        print(f"\n✅ Successfully updated {len(changes)} API charge limit parameters!")
        print(f"📁 Updated file: {self.workflow_file}")
        print(f"💾 Backup available in: {self.backup_dir}/")
        print(f"\n⚠️  Remember: Higher limits = higher potential costs!")
        
        return True

def main():
    """Main entry point"""
    updater = ChargeUpdater()
    success = updater.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()