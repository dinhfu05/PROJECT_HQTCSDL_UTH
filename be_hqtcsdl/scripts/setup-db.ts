import fs from 'fs';
import path from 'path';
import { database } from '../src/infra/database';

//Cách run npx ts-node scripts/setup-db.ts

async function runScript(filename: string) {
  const filePath = path.join(__dirname, filename);
  console.log(`\n🚀 Reading ${filename}...`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolon and filter empty statements
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Found ${queries.length} queries.`);

    for (const query of queries) {
      if (query.toUpperCase().startsWith('SELECT')) {
        await database.query(query);
      } else {
        await database.execute(query);
      }
    }
    
    console.log(`✅ ${filename} executed successfully.`);
  } catch (error) {
    console.error(`❌ Error running ${filename}:`, error);
    process.exit(1);
  }
}

async function main() {
  try {
    await database.connect();
    console.log('🔌 Connected to database');

    await runScript('create-tables.sql');
    await runScript('seed-data.sql');

    console.log('\n✨ Database setup complete!');
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await database.close();
  }
}

main();
