# OllaNews
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)


OllaNews is a news aggregation and summarization application designed to process current events through a local AI workflow. It provides both a web-based interface and a command-line tool to search for topics via Google News, extract article content, and generate concise summaries using local large language models. The project focuses on reducing information density by converting long-form articles into single-paragraph digests without relying on external cloud-based AI APIs.

## Architecture

The system is built on a modular Python backend using the Flask framework. The architecture is divided into three functional layers:

* **Data Acquisition**: Utilizes `pygooglenews` and `googlenewsdecoder` to fetch and resolve links from Google News.
* **Content Extraction**: Uses `trafilatura` to scrape full-text content from resolved URLs, with fallback mechanisms for RSS snippets.
* **Intelligence Layer**: Integrates with `Ollama` to run the `gemma3:1b` model locally, providing streaming text summaries to the frontend.

## Project Structure

```text
OllaNews/
├── app.py                # Flask web server
├── cli.py                # Command-line interface
├── requirements.txt      # Dependencies
├── data/
│   └── save.json         # Local bookmark storage
├── ollanews/             # Core logic package
│   ├── scraper.py        # Web scraping and extraction
│   ├── storage.py        # Persistence management
│   └── summarizer.py     # AI summarization logic
├── scripts/              # Installation and execution scripts
├── static/               # CSS and client-side JavaScript
└── templates/            # HTML templates
```

## Features

### News Fetching and Decoding
The application queries news entries based on user-defined topics. Since Google News often uses encrypted or redirect links, the system includes a decoding module to resolve the original source URL before attempting content extraction.

### Local AI Summarization
Summarization is handled by Ollama. The application sends the extracted article text to a local instance of Gemma 3. The process is configured to stream the output, allowing the interface to display the summary in real-time as it is generated. The prompt is structured to ensure the output is a single, continuous paragraph of plain text.

### Persistence
Users can archive specific articles and their generated summaries. These are stored locally in a JSON format within the `data/` directory, allowing for retrieval across different sessions without re-processing the original articles.

## Installation

### Prerequisites
* Python 3.x
* Ollama installed and running on the host machine

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/PranavDesai-Git/OllaNews.git
   cd OllaNews
   ```
2. Run the installation script to install Python dependencies and pull the required AI model:
   * **Windows**: `scripts\install.bat`
   * **Linux/Mac**: `bash scripts/install.sh`

## Usage

### Web Interface
To start the web application, run the startup script:
* **Windows**: `scripts\ollanews.bat`
* **Linux/Mac**: `./scripts/ollanews`

Once started, the application is accessible at `http://127.0.0.1:5000`. Users can enter a topic in the search bar, select an article, and trigger the AI summary.

### CLI Mode
For terminal-based usage, execute the `cli.py` file:
```bash
python cli.py
```
### Manual method
Make sure ollama is running by doing
```bash
ollama serve
```
Make sure you have the required model installed by doing 
```bash
ollama list
```
Start the server using
```bash
python app.py
```
You can also change the model you are using by doing
Linux/Mac:
```bash
export OLLAMA_MODEL="your_model_name"
```
Windows (CMD):
```batch
set OLLAMA_MODEL=your_model_name
```
Windows (PowerShell):
```powershell
$env:OLLAMA_MODEL="your_model_name"
```

Then you can visit the website by going to `localhost:5000`

This mode allows for quick searching and summarization directly within the command line, with options to save results to the local bookmark file.

## Contributors
* **Pranav Desai**
* **Sadiyah Shaik**
