// Quick script to check if MoMs exist in database
import { db } from './src/db/index.js';
import { momRecords, users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function checkData() {
  try {
    console.log('🔍 Checking database...\n');

    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`📊 Total users: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('Users:', allUsers.map(u => ({ id: u.id, email: u.email })));
      
      // Check MoMs for each user
      for (const user of allUsers) {
        const moms = await db
          .select()
          .from(momRecords)
          .where(eq(momRecords.userId, user.id));
        
        console.log(`\n👤 User ${user.email} (ID: ${user.id})`);
        console.log(`   MoMs: ${moms.length}`);
        
        if (moms.length > 0) {
          console.log('   Latest MoM:', {
            id: moms[0].id,
            title: moms[0].title,
            date: moms[0].date
          });
        }
      }
    }
    
    console.log('\n✅ Check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
