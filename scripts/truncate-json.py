#!/usr/bin/env python3
"""
JSON Truncation Script for VolaBot
Truncates JSON arrays to specified number of elements and saves to new file.

Usage: python3 truncate-json.py <json_file> <limit>
Example: python3 truncate-json.py dataset.json 5
"""

import json
import sys
import os
from pathlib import Path


def truncate_json_file(input_file, limit):
    """
    Truncate JSON file to specified number of elements.
    
    Args:
        input_file (str): Path to input JSON file
        limit (int): Number of elements to keep
        
    Returns:
        str: Path to output file if successful, None if failed
    """
    try:
        # Validate input file exists
        input_path = Path(input_file)
        if not input_path.exists():
            print(f"❌ Error: File '{input_file}' not found")
            return None
            
        if not input_path.is_file():
            print(f"❌ Error: '{input_file}' is not a file")
            return None
            
        # Validate limit
        if limit < 0:
            print(f"❌ Error: Limit must be non-negative, got {limit}")
            return None
            
        # Read JSON file
        print(f"📖 Reading {input_file}...")
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Validate JSON structure
        if not isinstance(data, list):
            print(f"❌ Error: JSON must be an array, got {type(data).__name__}")
            return None
            
        original_count = len(data)
        print(f"📊 Original array length: {original_count}")
        
        # Truncate data
        if limit >= original_count:
            print(f"⚠️ Warning: Limit ({limit}) >= array length ({original_count}), keeping all elements")
            truncated_data = data
        else:
            truncated_data = data[:limit]
            print(f"✂️ Truncated to first {limit} elements")
            
        # Generate output filename
        file_stem = input_path.stem
        file_suffix = input_path.suffix
        output_filename = f"{file_stem}-limit-{limit}{file_suffix}"
        output_path = input_path.parent / output_filename
        
        # Write truncated JSON
        print(f"💾 Writing to {output_path}...")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(truncated_data, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Success: Created {output_path}")
        print(f"📈 Size reduction: {original_count} → {len(truncated_data)} elements")
        
        return str(output_path)
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: Invalid JSON in '{input_file}': {e}")
        return None
    except PermissionError:
        print(f"❌ Permission Error: Cannot read/write files in this location")
        return None
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return None


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) != 3:
        print("❌ Usage: python3 truncate-json.py <json_file> <limit>")
        print("Example: python3 truncate-json.py apify/booking-scraper/dataset.json 5")
        sys.exit(1)
        
    input_file = sys.argv[1]
    try:
        limit = int(sys.argv[2])
    except ValueError:
        print(f"❌ Error: Limit must be an integer, got '{sys.argv[2]}'")
        sys.exit(1)
        
    # Perform truncation
    result = truncate_json_file(input_file, limit)
    
    if result is None:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()