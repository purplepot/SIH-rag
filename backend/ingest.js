import fs from 'fs';
import { ChromaClient } from 'chromadb';
import { embed } from './embed.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const client = new ChromaClient({ path: 'http://localhost:8000' });
  
  // Create collections
  await client.deleteCollection({ name: 'rail_docs' }).catch(() => {});
  await client.deleteCollection({ name: 'rail_qa' }).catch(() => {});
  
  const docsCollection = await client.createCollection({ name: 'rail_docs' });
  const qaCollection = await client.createCollection({ name: 'rail_qa' });
  
  const dataPath = path.join(__dirname, '../rag_questions_bank.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const qaPairs = JSON.parse(rawData).questions;
  
  console.log(`Loaded ${qaPairs.length} Q&A pairs from JSON.`);
  
  const ids = [];
  const embeddings = [];
  const metadatas = [];
  const documents = [];
  
  const qaIds = [];
  const qaMetadatas = [];
  const qaDocuments = [];
  
  for (let i = 0; i < qaPairs.length; i++) {
    const pair = qaPairs[i];
    const id = pair.id ? pair.id.toString() : `qa_${i}`;
    const category = pair.category || 'general';
    const question = pair.question;
    const answer = pair.answer;
    
    const chunkText = `Question: ${question}\nAnswer: ${answer}`;
    
    ids.push(id);
    metadatas.push({ id, category, question, answer });
    documents.push(chunkText);
    const emb = await embed(chunkText);
    embeddings.push(emb);
    
    qaIds.push(id);
    qaMetadatas.push({ id, category });
    qaDocuments.push(JSON.stringify({ question, answer }));
    
    if (i % 10 === 0) {
      console.log(`Processed ${i} / ${qaPairs.length}`);
    }
  }
  
  console.log('Adding to rail_docs collection...');
  await docsCollection.add({
    ids,
    embeddings,
    metadatas,
    documents
  });
  
  
  console.log('Ingestion complete!');
}

main().catch(console.error);
