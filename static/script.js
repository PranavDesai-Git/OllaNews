let currentArticle = null;
let currentRawText = "";

function getArticleCacheKey(article) {
    const keySource = article.link || article.title || 'unknown-article';
    return `ollanews_summary_${encodeURIComponent(keySource)}`;
}

function getCachedSummary(article) {
    return localStorage.getItem(getArticleCacheKey(article));
}

function cacheSummary(article, summary) {
    if (!article) return;
    localStorage.setItem(getArticleCacheKey(article), summary);
}

async function searchNews() {
    const topic = document.getElementById('topicInput').value;
    if(!topic) return;

    document.getElementById('landing').classList.add('shifted');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">DISPATCHING REPORTERS...</p>';

    const formData = new FormData();
    formData.append('topic', topic);
    
    const response = await fetch('/search', { method: 'POST', body: formData });
    const articles = await response.json();
    
    resultsDiv.innerHTML = '';
    articles.forEach((art, index) => {
        const card = document.createElement('div');
        card.className = 'article-card pressable';
        card.id = `card-${index}`;
        card.innerHTML = `<h3>${art.title}</h3><p style="font-size:0.7rem; margin-top:15px;">LOADING PREVIEW...</p>`;
        card.onclick = () => openReader(art, index);
        resultsDiv.appendChild(card);
        autoScrape(art, index);
    });
}

async function autoScrape(articleData, index) {
    const card = document.getElementById(`card-${index}`);
    const response = await fetch('/get_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
    });
    const data = await response.json();

    if (!data.raw_text) {
        card.classList.add('hidden');
    } else {
        card.setAttribute('data-raw', data.raw_text);
        card.querySelector('p').innerHTML = data.raw_text.substring(0, 150) + "... [READ MORE]";
    }
}

function openReader(art, index) {
    currentArticle = art;
    currentArticle.index = index;
    const card = document.getElementById(`card-${index}`);
    currentRawText = card.getAttribute('data-raw') || "";
    let cachedSummary = card.getAttribute('data-summary');

    if (!cachedSummary) {
        const storedSummary = getCachedSummary(art);
        if (storedSummary) {
            cachedSummary = storedSummary;
            card.setAttribute('data-summary', cachedSummary);
        }
    }
    
    document.getElementById('readerTitle').innerText = art.title;
    document.getElementById('readerBody').innerText = currentRawText;
    
    const sumBtn = document.getElementById('sumBtn');
    const output = document.getElementById('aiOutput');
    const textTarget = document.getElementById('streamingText');
    const status = document.getElementById('aiStatus');
    const saveBtn = document.getElementById('saveBtn');

    saveBtn.innerText = card.getAttribute('data-saved') === 'true' ? '[ARCHIVED]' : '[SAVE TO ARCHIVE]';
    saveBtn.disabled = card.getAttribute('data-saved') === 'true';

    if (cachedSummary) {
        sumBtn.style.display = 'none';
        output.style.display = 'block';
        status.style.display = 'none';
        textTarget.innerHTML = cachedSummary;
    } else {
        sumBtn.style.display = 'inline-block';
        output.style.display = 'none';
        textTarget.innerHTML = "";
    }

    document.getElementById('readerView').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeReader() {
    document.getElementById('readerView').style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function triggerAI() {
    const textTarget = document.getElementById('streamingText');
    const status = document.getElementById('aiStatus');
    const output = document.getElementById('aiOutput');
    const sumBtn = document.getElementById('sumBtn');

    sumBtn.style.display = 'none';
    output.style.display = 'block';
    status.style.display = 'block';
    textTarget.innerHTML = "";

    const response = await fetch('/summarize_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentArticle, raw_text: currentRawText })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullSummary = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        lines.forEach(line => {
            if (line.startsWith('data: ')) {
                status.style.display = 'none';
                const content = line.replace('data: ', '');
                fullSummary += content;
                textTarget.innerHTML = fullSummary;
            }
        });
    }
    
    const card = document.getElementById(`card-${currentArticle.index}`);
    if(card) card.setAttribute('data-summary', fullSummary);
    cacheSummary(currentArticle, fullSummary);
}

async function saveArticle() {
    const textTarget = document.getElementById('streamingText');
    const saveBtn = document.getElementById('saveBtn');
    const card = document.getElementById(`card-${currentArticle.index}`);
    const cachedSummary = card ? card.getAttribute('data-summary') : null;
    const summary = textTarget.innerText || cachedSummary || 'No summary';

    const payload = {
        title: currentArticle.title,
        link: currentArticle.link,
        summary: summary,
        article_text: currentRawText,
        source: "Web"
    };

    const resp = await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (resp.ok) {
        saveBtn.innerText = "[ARCHIVED]";
        saveBtn.disabled = true;
        if(card) card.setAttribute('data-saved', 'true');
    }
}

async function openArchive() {
    const list = document.getElementById('archiveList');
    list.innerHTML = "Fetching archives...";
    document.getElementById('archiveView').style.display = 'block';
    document.body.style.overflow = 'hidden';

    const resp = await fetch('/get_bookmarks'); 
    const saved = await resp.json();

    list.innerHTML = "";
    if (saved.length === 0) {
        list.innerHTML = "<p>Archive is empty.</p>";
        return;
    }

    saved.forEach(item => {
        const div = document.createElement('div');
        div.className = 'archive-item';
        div.innerHTML = `
            <h3 style="font-family:'Playfair Display';">${item.title}</h3>
            <p style="font-size:0.9rem; color:#555;">${item.summary}</p>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="pressable read-btn" style="padding: 8px 15px; font-size: 0.8rem;">[READ EXTRACTED ARTICLE]</button>
                <a href="${item.link}" target="_blank" style="font-size:0.7rem; color:var(--ink); text-decoration: none; padding: 8px 15px; border: 2px solid var(--ink); background: var(--paper);">[SOURCE]</a>
            </div>
        `;
        div.querySelector('.read-btn').addEventListener('click', () => openArchivedReader(item));
        list.appendChild(div);
    });
}

function closeArchive() {
    document.getElementById('archiveView').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openArchivedReader(item) {
    currentArticle = { title: item.title, link: item.link };
    currentRawText = item.article_text || "No extracted text available.";

    document.getElementById('readerTitle').innerText = item.title;
    document.getElementById('readerBody').innerText = currentRawText;

    const sumBtn = document.getElementById('sumBtn');
    const output = document.getElementById('aiOutput');
    const textTarget = document.getElementById('streamingText');
    const status = document.getElementById('aiStatus');
    const saveBtn = document.getElementById('saveBtn');

    saveBtn.innerText = '[ARCHIVED]';
    saveBtn.disabled = true;

    if (item.summary && item.summary !== 'No summary') {
        sumBtn.style.display = 'none';
        output.style.display = 'block';
        status.style.display = 'none';
        textTarget.innerHTML = item.summary;
    } else {
        sumBtn.style.display = 'none'; // Hide since it's archived
        output.style.display = 'none';
        textTarget.innerHTML = "";
    }

    document.getElementById('readerView').style.display = 'block';
    document.body.style.overflow = 'hidden';
}
