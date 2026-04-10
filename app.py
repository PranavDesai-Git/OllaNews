#!/usr/bin/env python3
from flask import Flask, render_template, request, jsonify, Response
import scraper
import summarizer
import storage

app = Flask(__name__)

@app.route('/')
def index():
    bookmarks = storage.get_all_bookmarks()
    return render_template('index.html', bookmarks=bookmarks)

@app.route('/search', methods=['POST'])
def search():
    topic = request.form.get('topic')
    articles = scraper.fetch_news_links(topic)
    return jsonify(articles)

@app.route('/get_text', methods=['POST'])
def get_text():
    article_data = request.get_json()
    raw_text = scraper.extract_article_text(article_data)

    # Filter out empty or garbage scrapes
    if not raw_text or len(raw_text) < 500:
        return jsonify({"raw_text": None}), 200

    return jsonify({"raw_text": raw_text})

@app.route('/summarize_stream', methods=['POST'])
def summarize_stream():
    data = request.get_json()
    text = data.get('raw_text')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    def generate():
        for chunk in summarizer.generate_streaming_summary(text):
            if chunk:
                yield f"data: {chunk}\n\n"

    return Response(generate(), mimetype='text/event-stream')

@app.route('/save', methods=['POST'])
def save():
    data = request.get_json()
    success = storage.save_bookmark(
        title=data.get('title'),
        link=data.get('link'),
        summary=data.get('summary'),
        source=data.get('source', 'Web')
    )
    return jsonify({"status": "success" if success else "error"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
