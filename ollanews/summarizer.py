import ollama
import os

MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")

def generate_streaming_summary(text):
    if not text:
        yield "No text provided for summary."
        return

    prompt = (
        f"Summarize the following text into a single, continuous paragraph of plain text. "
        f"Do not use any markdown formatting, bolding, bullet points, or headers. "
        f"Just write one standard paragraph:\n\n{text}"
    )

    stream = ollama.chat(
        model=MODEL,
        messages=[{'role': 'user', 'content': prompt}],
        stream=True
    )

    for chunk in stream:
        content = chunk.get('message', {}).get('content', '')
        if content:
            clean_content = content.replace("**", "").replace("* ", "")
            yield clean_content
