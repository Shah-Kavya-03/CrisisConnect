import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crisisconnect';

async function importAll() {
  try {
    const inputPath = path.join(__dirname, '../../db_dump.json');
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: File not found at ${inputPath}`);
      console.error('Please make sure db_dump.json is present in the server directory.');
      process.exit(1);
    }

    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const raw = fs.readFileSync(inputPath, 'utf8');
    const dump = JSON.parse(raw);

    for (const [colName, docs] of Object.entries(dump)) {
      if (Array.isArray(docs) && docs.length > 0) {
        const col = mongoose.connection.db.collection(colName);
        await col.deleteMany({});
        await col.insertMany(docs);
        console.log(`Imported ${docs.length} documents into [${colName}]`);
      } else {
        console.log(`Skipped [${colName}] (0 documents)`);
      }
    }

    console.log('\nAll data successfully imported into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

importAll();
