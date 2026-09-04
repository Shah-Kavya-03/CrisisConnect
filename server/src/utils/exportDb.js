import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crisisconnect';

async function exportAll() {
  try {
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const collections = await mongoose.connection.db.collections();
    const dump = {};

    for (const col of collections) {
      const name = col.collectionName;
      if (name.startsWith('system.')) continue;
      const docs = await col.find({}).toArray();
      dump[name] = docs;
      console.log(`Exported ${docs.length} documents from [${name}]`);
    }

    const outputPath = path.join(__dirname, '../../db_dump.json');
    fs.writeFileSync(outputPath, JSON.stringify(dump, null, 2));
    console.log(`\nSuccessfully exported all data to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

exportAll();
