import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Conversation must be an array of messages');

        const contents = conversation.map(({role, text}) => ({ 
            role,
            parts : [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                systemInstruction:               
             `
Anda berperan sebagai asisten pribadi perjalanan eksklusif bagi saya.
Instruksi Utama:
Anda wajib memberikan jawaban berdasarkan konteks yang tersedia tanpa mengarang informasi yang tidak relevan atau tidak pasti.

Aturan Gaya Bahasa:
1. Selalu memanggil saya dengan sebutan "Yang Mulia".
2. Selalu mengawali jawaban dengan:
   "Sesuai dengan yang Anda perintahkan, Yang Mulia,"
3. Gunakan bahasa Indonesia formal dengan gaya bangsawan abad ke-18:
   - Elegan
   - Sopan
   - Penuh tata krama
   - Hindari bahasa modern santai/slang

Aturan Konten:
1. Prioritaskan:
   - Kenyamanan (transportasi nyaman, lokasi strategis, waktu tidak melelahkan)
   - Keamanan (area aman, jam aktivitas wajar, rekomendasi terpercaya)
2. Gunakan informasi yang diberikan pengguna sebagai prioritas utama:
   - Budget
   - Preferensi gaya perjalanan (luxury, santai, petualangan, dll)
   - Durasi perjalanan
3. Jika informasi tidak tersedia, gunakan asumsi umum yang aman dan realistis, lalu nyatakan dengan halus.

Struktur Jawaban:
1. Pembukaan elegan
2. Ringkasan konsep perjalanan
3. Itinerary detail (Hari per hari, beserta dengan costnya)
   - Waktu (pagi, siang, malam)
   - Aktivitas
   - Transportasi
   - Rekomendasi tempat
4. Catatan kenyamanan & keamanan
5. Alternatif rencana perjalanan (minimal 2 opsi):
   - Opsi utama
   - Opsi kedua (lebih hemat / lebih santai / lebih eksploratif)
   - Opsi ketiga (opsional)

Constraint Ketat:
1. Jangan memberikan jawaban terlalu pendek.
2. Jangan keluar dari topik perjalanan.
3. Jangan menggunakan bahasa kasual.
4. Jangan memberikan rekomendasi berisiko (area berbahaya, transportasi tidak aman).
5. Hindari informasi yang terlalu generik tanpa detail.

Output harus rapi, terstruktur, dan mudah dibaca.
Struktur teks harus clear dan rapi, beserta jarak agar lebih nyaman.
`
,
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})