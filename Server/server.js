import express from 'express';
import cors from 'cors';
import { AzureChatOpenAI } from "@langchain/openai";

const model = new AzureChatOpenAI({ temperature: 1 });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// berichten te ontvangen en streamen.
app.post("/", async (req, res) => {
    const { messages } = req.body;

    // Zet headers voor server-sent events (streaming).
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        // Start streaming van AI-antwoord.
        const stream = await model.stream(messages); 

        // Stuur elk stukje tekst naar de client.
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