import express from 'express';
import cors from 'cors';
import { AzureChatOpenAI } from "@langchain/openai";

const model = new AzureChatOpenAI({ temperature: 1 });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint om AI-chatberichten te ontvangen en streamen.
app.post("/", async (req, res) => {
    const { messages } = req.body;

    // Zet headers voor server-sent events (streaming).
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const stream = await model.stream(messages); // Start streaming van AI-antwoord.

        // Stuur elk stukje tekst naar de client.
        for await (const chunk of stream) {
            if (chunk?.content) {
                res.write(`data: ${chunk.content}\n\n`);
            }
        }
        res.end(); // Sluit de verbinding als stream klaar is.
    } catch (err) {
        console.error("Streaming fout:", err); // Logt eventuele fouten.
        res.end(); // Sluit de verbinding bij fout.
    }
});

// Start de server op de opgegeven poort.
app.listen(process.env.PORT, () => {
    console.log(`Server draait op http://localhost:${process.env.PORT}`);
});

