# Gemini Travel Planner AI

AI Travel Planner berbasis Google Gemini yang dirancang untuk membantu pengguna menyusun rencana perjalanan secara detail, nyaman, aman, dan terstruktur.

Aplikasi ini menggunakan Google Gemini API sebagai mesin AI, Express.js sebagai backend API, dan antarmuka web sederhana berbasis HTML, CSS, dan JavaScript.

## Features

* AI-powered travel planning menggunakan Google Gemini
* Multi-turn conversation (chat history)
* Itinerary perjalanan harian yang terstruktur
* Estimasi biaya perjalanan
* Prioritas kenyamanan dan keamanan perjalanan
* Antarmuka web sederhana dan responsif
* Backend REST API menggunakan Express.js

## Tech Stack

### Backend

* Node.js
* Express.js
* Google Gemini API
* CORS
* dotenv

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

## AI Behavior

Asisten AI dirancang untuk:

* Bertindak sebagai asisten perjalanan pribadi
* Memberikan itinerary yang detail dan realistis
* Memprioritaskan kenyamanan pengguna
* Mempertimbangkan keamanan destinasi dan transportasi
* Menyusun aktivitas berdasarkan durasi perjalanan
* Menampilkan estimasi biaya perjalanan
* Menyajikan jawaban yang rapi dan mudah dibaca

## Project Structure

```text
gemini-chatbot-api/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── index.js
├── package.json
├── .gitignore
└── .env
```

## Installation

Clone repository:

```bash
git clone https://github.com/yusufalhafidz-lab/Gemini-ChatBot-API.git
cd Gemini-ChatBot-API
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run application:

```bash
node index.js
```

Open:

```text
http://localhost:3000
```

## Example Prompt

```text
Saya ingin berlibur 3 hari di Jepang dengan budget 15 juta rupiah.
```

```text
Saya ingin perjalanan santai di Turki selama 5 hari.
```

```text
Buat itinerary keluarga ke Malaysia selama 4 hari.
```

## API Endpoint

### POST /api/chat

Request:

```json
{
  "conversation": [
    {
      "role": "user",
      "text": "Saya ingin berlibur 3 hari di Jepang"
    }
  ]
}
```

Response:

```json
{
  "result": "Itinerary perjalanan..."
}
```

## Future Improvements

* User authentication
* Streaming Gemini responses
* Destination recommendation database
* Flight and hotel integration
* Travel budget optimization
* Markdown rendering
* Conversation persistence
* Multi-language support
