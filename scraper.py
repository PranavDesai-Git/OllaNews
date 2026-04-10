import trafilatura
from pygooglenews import GoogleNews
from googlenewsdecoder import new_decoderv1

gn = GoogleNews()

def fetch_news_links(topic):
    return gn.search(topic)['entries'][:10]

def resolve_url(google_url):
    try:
        decoded = new_decoderv1(google_url)
        return decoded["decoded_url"] if decoded.get("status") else google_url
    except:
        return google_url

def extract_article_text(article_entry):
    """
    Takes the WHOLE article object so it can fall back to
    the RSS snippet if the live website blocks us.
    """
    url = resolve_url(article_entry['link'])

    # Try full scrape
    downloaded = trafilatura.fetch_url(url)
    if downloaded:
        content = trafilatura.extract(downloaded)
        if content and len(content) > 400: # Threshold for a 'real' article
            return content

    # Fallback: Use the RSS summary snippet
    # Trafilatura can also clean up the HTML inside the RSS summary
    snippet = trafilatura.extract(article_entry.get('summary', ''))
    return snippet if snippet else article_entry.get('title', '')
