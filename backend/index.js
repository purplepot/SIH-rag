import express from 'express';
import cors from 'cors';
import { chat, initCollections } from './rag.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'RailSahayak RAG Backend' });
});

app.post('/chat', async (req, res) => {
  try {
    const { messages, lang } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    const result = await chat(messages, lang);
    res.json(result);
  } catch (error) {
    console.error('Error during chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function startServer() {
  try {
    await initCollections();
    console.log('Chroma collections initialized.');
    app.listen(port, () => {
      console.log(`Backend server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize or start server:', error);
  }
}

startServer();
