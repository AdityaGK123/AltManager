// Quick diagnostic script to check MoMs in database
const { Client } = require('pg');
require('dotenv').config();

async function checkMoMs() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check MoM records
    const momsResult = await client.query('SELECT id, user_id, conversation_id, title, date, created_at FROM mom_records ORDER BY created_at DESC LIMIT 10');
    console.log(`📊 Total MoMs found: ${momsResult.rowCount}`);
    
    if (momsResult.rowCount > 0) {
      console.log('\n📝 Recent MoMs:');
      momsResult.rows.forEach((mom, index) => {
        console.log(`  ${index + 1}. ID: ${mom.id} | User: ${mom.user_id} | Conversation: ${mom.conversation_id}`);
        console.log(`     Title: ${mom.title}`);
        console.log(`     Date: ${mom.date} | Created: ${mom.created_at}\n`);
      });
    } else {
      console.log('❌ No MoMs found in database\n');
    }

    // Check conversations
    const convsResult = await client.query('SELECT id, user_id, title, status, created_at, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 10');
    console.log(`💬 Total Conversations found: ${convsResult.rowCount}`);
    
    if (convsResult.rowCount > 0) {
      console.log('\n💬 Recent Conversations:');
      convsResult.rows.forEach((conv, index) => {
        console.log(`  ${index + 1}. ID: ${conv.id} | User: ${conv.user_id} | Status: ${conv.status}`);
        console.log(`     Title: ${conv.title}`);
        console.log(`     Created: ${conv.created_at} | Updated: ${conv.updated_at}\n`);
      });
    }

    // Check messages for recent conversations
    if (convsResult.rowCount > 0) {
      const recentConvId = convsResult.rows[0].id;
      const messagesResult = await client.query(
        'SELECT id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [recentConvId]
      );
      
      console.log(`\n📨 Messages in most recent conversation (ID: ${recentConvId}): ${messagesResult.rowCount}`);
      if (messagesResult.rowCount > 0) {
        let totalLength = 0;
        messagesResult.rows.forEach((msg, index) => {
          const preview = msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : '');
          console.log(`  ${index + 1}. [${msg.role}] ${preview}`);
          totalLength += msg.content.length;
        });
        console.log(`\n  Total transcript length: ${totalLength} characters`);
        console.log(`  ${totalLength >= 50 ? '✅' : '❌'} Meets minimum requirement (50 chars)`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkMoMs();
