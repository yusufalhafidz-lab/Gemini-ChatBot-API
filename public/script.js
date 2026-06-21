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
  const normalized = text.replace(/\r/g, '').trim();
  const blocks = normalized.split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) return '';

      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        const items = lines.map((line) => {
          const content = line.replace(/^\d+\.\s+/, '');
          return `<li>${formatInline(content)}</li>`;
        });
        return `<ol>${items.join('')}</ol>`;
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        const items = lines.map((line) => {
          const content = line.replace(/^[-*]\s+/, '');
          return `<li>${formatInline(content)}</li>`;
        });
        return `<ul>${items.join('')}</ul>`;
      }

      const htmlLines = lines.map((line) => {
        if (/^#{1,6}\s+/.test(line)) {
          const level = Math.min(line.match(/^#+/)?.[0].length || 1, 3);
          const content = line.replace(/^#{1,6}\s+/, '');
          return `<h${level}>${formatInline(content)}</h${level}>`;
        }

        if (/^\d+\.\s+/.test(line)) {
          const content = line.replace(/^\d+\.\s+/, '');
          return `<p><strong>${formatInline(content)}</strong></p>`;
        }

        return `<p>${formatInline(line)}</p>`;
      });

      return htmlLines.join('');
    })
    .filter(Boolean)
    .join('');
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
