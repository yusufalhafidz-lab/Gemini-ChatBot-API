const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]');

let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = '';
  setLoading(true);

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  const loadingMessage = appendLoadingMessage();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get response from server.');
    }

    const result = typeof data.result === 'string' ? data.result.trim() : '';
    if (!result) {
      throw new Error('Sorry, no response received.');
    }

    conversation.push({ role: 'model', text: result });
    renderBotReply(loadingMessage, result);
  } catch (error) {
    renderBotReply(
      loadingMessage,
      error.message || 'Failed to get response from server.'
    );
  } finally {
    setLoading(false);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function appendLoadingMessage() {
  const msg = appendMessage('bot', '');
  msg.classList.add('loading');
  msg.innerHTML = `
    <span class="loading-dots" aria-label="Loading">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  return msg;
}

function renderBotReply(messageElement, text) {
  messageElement.classList.remove('loading');
  messageElement.innerHTML = formatReplyText(text);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function formatReplyText(text) {
  const normalized = normalizeText(text);
  const blocks = normalized
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return '<p>Sorry, no response received.</p>';
  }

  return blocks
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return '';

      if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        const items = lines.map((line) => {
          const content = line.replace(/^\d+[.)]\s+/, '');
          return `<li>${formatInline(content)}</li>`;
        });
        return `<ol>${items.join('')}</ol>`;
      }

      if (lines.every((line) => /^[-*•]\s+/.test(line))) {
        const items = lines.map((line) => {
          const content = line.replace(/^[-*•]\s+/, '');
          return `<li>${formatInline(content)}</li>`;
        });
        return `<ul>${items.join('')}</ul>`;
      }

      if (lines.every((line) => /^#{1,6}\s+/.test(line))) {
        return lines
          .map((line) => {
            const level = Math.min(line.match(/^#+/)?.[0].length || 1, 3);
            const content = line.replace(/^#{1,6}\s+/, '');
            return `<h${level}>${formatInline(content)}</h${level}>`;
          })
          .join('');
      }

      const paragraphText = lines.join(' ');
      const paragraphs = splitReadableParagraphs(paragraphText);

      return paragraphs.map((para) => `<p>${formatInline(para)}</p>`).join('');
    })
    .filter(Boolean)
    .join('');
}

function normalizeText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\s+([,;:])/g, '$1')
    .replace(/([.!?])(?=[A-Za-zÀ-ÿ\d"'])/g, '$1 ')
    .replace(/([.!?])\s{2,}/g, '$1 ')
    .trim();
}

function splitReadableParagraphs(text) {
  const cleaned = normalizeText(text);

  const sentences = cleaned.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [cleaned];

  if (sentences.length <= 1) {
    return cleaned.length > 0 ? [cleaned] : [];
  }

  const paragraphs = [];
  let current = '';

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    if (!current) {
      current = trimmed;
      return;
    }

    const next = `${current} ${trimmed}`;
    if (next.length <= 180 || current.split(/\s+/).length < 8) {
      current = next;
    } else {
      paragraphs.push(current);
      current = trimmed;
    }
  });

  if (current) paragraphs.push(current);
  return paragraphs;
}

function formatInline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });
}

function setLoading(isLoading) {
  input.disabled = isLoading;
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Sending...' : 'Send';
}
