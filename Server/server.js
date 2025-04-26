import express from 'express';
import cors from 'cors';
import { AzureChatOpenAI } from "@langchain/openai";
import path from 'path';
import { fileURLToPath } from 'url'; // Needed for __dirname
import 'dotenv/config';


const model = new AzureChatOpenAI({ temperature: 1 });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup __dirname manually because ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, '../Client')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client', 'index.html'));
});

// Streaming API
app.post("/", async (req, res) => {
    const { messages } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const stream = await model.stream(messages);
        for await (const chunk of stream) {
            if (chunk?.content) {
                res.write(`data: ${chunk.content}\n\n`);
            }
        }
        res.end();
    } catch (err) {
        console.error("Streaming fout:", err);
        res.end();
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server draait op http://localhost:${process.env.PORT}`);
});