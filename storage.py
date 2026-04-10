#!/usr/bin/env python3

import json
import os

FILE_PATH = 'save.json'

def save_to_bookmarks(data):
    current_data = []

    if os.path.exists(FILE_PATH):
        with open(FILE_PATH, 'r') as f:
            try:
                current_data = json.load(f)
            except json.JSONDecodeError:
                current_data = []

    current_data.append(data)

    with open(FILE_PATH, 'w') as f:
        json.dump(current_data, f, indent=4)

def get_all_bookmarks():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r') as f:
        return json.load(f)
