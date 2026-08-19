import { ChromaClient } from 'chromadb';
import { embed } from './embed.js';
import { generateAnswer } from './gemini.js';

let client;
let docsCollection;

function smallTalkResponse(text, lang) {
  const normalized = text.trim().toLowerCase().replace(/[!?.,]+$/g, '');
  const greeting = /^(hi+|hello|hey|good morning|good afternoon|good evening|namaste|नमस्ते|हैलो|हाय)$/u;
  if (greeting.test(normalized)) {
    return lang === 'hi'
      ? 'नमस्ते! मैं रेलसहायक हूँ। मैं टिकट बुकिंग, PNR, ट्रेन शिकायत, रिफंड और यात्रा संबंधी जानकारी में आपकी मदद कर सकता हूँ। आप क्या जानना चाहते हैं?'
      : 'Hi! I am RailSahayak. I can help with ticket booking, PNR, train complaints, refunds, and travel information. What would you like to know?';
  }

  return null;
}

function answerFromDocument(document = '') {
  const marker = '\nAnswer: ';
  const markerIndex = document.indexOf(marker);
  return markerIndex >= 0 ? document.slice(markerIndex + marker.length).trim() : document.trim();
}

export async function initCollections() {
  try {
    client = new ChromaClient({ path: 'http://localhost:8000' });
    docsCollection = await client.getCollection({ name: 'rail_docs' });
  } catch(e) {
    console.error("Failed to init collections. Ensure chroma is running and data is ingested.", e.message);
  }
}

export async function chat(messages, lang = 'en') {
  if (!docsCollection) {
    await initCollections();
  }
  
  const lastMessage = messages[messages.length - 1].content;
  const smallTalk = smallTalkResponse(lastMessage, lang);
  if (smallTalk) {
    return {
      answer: smallTalk,
      sources: { category: lang === 'hi' ? 'सामान्य' : 'General' }
    };
  }
  
  const queryEmbedding = await embed(lastMessage);
  const results = await docsCollection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 5
  });
  
  const contexts = results.documents[0];
  const metadatas = results.metadatas[0];
  
  let contextText = contexts.join('\n\n---\n\n');
  
  const langInstruction = lang === 'hi' 
    ? "IMPORTANT: You MUST respond entirely in Hindi (Devanagari script), regardless of what language the user typed in."
    : "IMPORTANT: You MUST respond entirely in English.";
  
const systemPrompt = `You are RailSahayak, a helpful and knowledgeable Indian Railways assistant. 
You help citizens with train booking, PNR status, complaints, temple routes, hotels, cancellation, refunds, and all railway services.
Answer the user's question using primarily the following context from the Indian Railways knowledge base. If the user asks for a price/fare estimate, you are allowed to use your internal knowledge to provide a rough, generic estimate, but always remind them to check the official website for exact fares.
${langInstruction}
Be concise, helpful, and provide step-by-step instructions when applicable.
If the context doesn't have enough information (and it's not a price estimate), say so and suggest calling Railway Helpline 139.
Do NOT mention that you are reading from a context or knowledge base.

CONTEXT:
${contextText}`;

  let answer;
  try {
    answer = await generateAnswer(messages, systemPrompt);
  } catch (error) {
    // The retrieval result is still useful when the text-generation provider is
    // unavailable (for example, a temporary quota or network failure). Return
    // the most relevant curated answer instead of turning a valid query into a
    // frontend-wide "call 139" fallback.
    console.error('Generation failed; returning retrieved answer:', error.message);
    answer = answerFromDocument(contexts[0]);
  }

  return {
    answer,
    sources: metadatas[0]
  };
}
