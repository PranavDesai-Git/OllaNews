#!/usr/bin/env python3

import scraper
import summarizer
import storage
import sys

def main():
    print("=== AI News CLI ===")
    topic = input("Enter a topic to search: ")

    print(f"\nFetching news for '{topic}'...")
    articles = scraper.fetch_news_links(topic)

    if not articles:
        print("No articles found.")
        return

    for i, art in enumerate(articles):
        print(f"[{i+1}] {art['title']}")

    print("\nOptions:")
    print("  [Number] - Summarize a specific article")
    print("  'all'    - Summarize all 10 (this will take a while)")
    print("  'q'      - Quit")

    choice = input("\nChoice: ").strip().lower()

    if choice == 'q':
        sys.exit()

    elif choice == 'all':
        for art in articles:
            process_and_print(art)

    elif choice.isdigit():
        idx = int(choice) - 1
        if 0 <= idx < len(articles):
            process_and_print(articles[idx])
        else:
            print("Invalid number.")

    else:
        print("Invalid choice.")

def process_and_print(article):
    print(f"\n--- Processing: {article['title']} ---")

    text = scraper.extract_article_text(article)

    summary = summarizer.generate_summary(text)

    print(f"\nAI Summary:\n{summary}")

    storage.save_to_bookmarks({
        "title": article['title'],
        "url": article['link'],
        "summary": summary
    })
if __name__ == "__main__":
    while True:
        main()
        cont = input("\nSearch another topic? (y/n): ").lower()
        if cont != 'y':
            break
