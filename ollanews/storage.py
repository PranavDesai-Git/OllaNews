#!/usr/bin/env python3

import json
import os

FILE_PATH = 'data/save.json'

def save_to_bookmarks(title=None, link=None, summary=None, source='Web', **kwargs):
    bookmark = {
        'title': title,
        'link': link,
        'summary': summary,
        'source': source
    }
    bookmark.update({k: v for k, v in kwargs.items() if k not in bookmark or bookmark[k] is None})

    current_data = []

    if os.path.exists(FILE_PATH):
        with open(FILE_PATH, 'r') as f:
            try:
                current_data = json.load(f)
            except json.JSONDecodeError:
                current_data = []

    current_data.append(bookmark)

    with open(FILE_PATH, 'w') as f:
        json.dump(current_data, f, indent=4)

    return True

def get_all_bookmarks():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []
