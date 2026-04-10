import ollama
import os

MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

def generate_streaming_summary(text):
    if not text:
        yield "No text provided for summary."
        return

    prompt = f"Summarize the following text in a concise paragraph:\n\n{text}"

    stream = ollama.chat(
        model=MODEL,
        messages=[{'role': 'user', 'content': prompt}],
        stream=True
    )

    for chunk in stream:
        content = chunk.get('message', {}).get('content', '')
        if content:
            yield content
