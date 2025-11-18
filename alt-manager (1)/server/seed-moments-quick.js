/**
 * Quick Seed Script for Manager Moments
 * Seeds all moments into the database
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🌱 Seeding Manager Moments...\n');
console.log('='.repeat(60));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : undefined,
});

// All moments matching frontend data exactly
const MOMENTS = [
  // Communication (7)
  { id: 'bluf-your-message', title: 'BLUF Your Message', description: 'Write concise updates that drive decisions with clear asks, risks, and next steps', prompt: 'Practice BLUF communication', category: 'Communication' },
  { id: 'slack-chaos-into-signal', title: 'Turn Slack Chaos into Signal', description: 'Convert scattered threads into clear decisions, owners, and dates', prompt: 'Organize messy Slack threads', category: 'Communication' },
  { id: 'repair-note-after-misstep', title: 'Write a Repair Note After a Misstep', description: 'Rebuild trust with ownership, specific changes, and verification plans', prompt: 'Write a repair note', category: 'Communication' },
  { id: 'stakeholder-update', title: 'Prepare Stakeholder Update', description: 'Lead with topline status, quantified variance, and decision asks', prompt: 'Prepare stakeholder update', category: 'Communication' },
  { id: 'difficult-conversation', title: 'Having a Difficult Conversation', description: 'Address behavior issues using SBI framework while preserving relationships', prompt: 'Have a difficult conversation', category: 'Communication' },
  { id: 'stakeholder-bad-news', title: 'Delivering Bad News to Stakeholders', description: 'Share bad news early with facts, options, and solution-oriented approach', prompt: 'Deliver bad news', category: 'Communication' },
  { id: 'difficult-performance-conversation', title: 'Having a Difficult Performance Conversation', description: 'Address performance gaps with evidence, expectations, and support', prompt: 'Have a performance conversation', category: 'Communication' },
  
  // Organization (7)
  { id: 'managing-priorities', title: 'Managing Competing Priorities', description: 'Triage tasks using Must/Should/Could framework with clear trade-offs', prompt: 'Manage priorities', category: 'Organization' },
  { id: 'weekly-plan-that-sticks', title: 'Weekly Plan That Sticks', description: 'Create predictable plans with outcomes, focus blocks, and urgent paths', prompt: 'Create weekly plan', category: 'Organization' },
  { id: 'one-page-project-brief', title: 'One-Page Project Brief', description: 'Align teams on goals, scope, owners, timeline, and risks before building', prompt: 'Write project brief', category: 'Organization' },
  { id: 'personal-operating-system', title: 'Personal Operating System', description: 'Build repeatable systems for capture, planning, execution, and review', prompt: 'Build operating system', category: 'Organization' },
  { id: 'task-prioritization', title: 'Organize Chaotic Workload', description: 'Consolidate scattered tasks into single source of truth with status groups', prompt: 'Organize workload', category: 'Organization' },
  { id: 'task-brain-dump', title: 'Get Tasks Out of Your Head', description: 'Externalize mental load and create traction on top 3 Must items', prompt: 'Brain dump tasks', category: 'Organization' },
  { id: 'priority-triage', title: 'Triage Competing Priorities', description: 'Present viable options with trade-offs and recommend path to protect goals', prompt: 'Triage priorities', category: 'Organization' },
  
  // Collaboration (3)
  { id: 'cross-team-collaboration', title: 'Collaborating Across Teams', description: 'Align on outcomes, roles, dependencies, and cadence with partner teams', prompt: 'Collaborate across teams', category: 'Collaboration' },
  { id: 'boundary-setting', title: 'Set Boundaries Without Burning Bridges', description: 'Protect work-life balance while maintaining trust and responsiveness', prompt: 'Set boundaries', category: 'Collaboration' },
  { id: 'team-conflict', title: 'Navigate Team Conflict', description: 'De-escalate tension and move toward shared outcomes without taking sides', prompt: 'Navigate conflict', category: 'Collaboration' },
  
  // Growth (3)
  { id: 'building-confidence', title: 'Building Confidence Through Small Wins', description: 'Regain momentum via small, controllable wins tied to measurable outcomes', prompt: 'Build confidence', category: 'Growth' },
  { id: 'receiving-feedback', title: 'Receiving Feedback Effectively', description: 'Acknowledge, apply, and verify feedback with evidence and follow-up', prompt: 'Receive feedback', category: 'Growth' },
  { id: 'taking-ownership', title: 'Taking Ownership and Accountability', description: 'Own outcomes, fix issues, and prevent recurrence with verification', prompt: 'Take ownership', category: 'Growth' },
  
  // Deadlines (3)
  { id: 'communicate-delay-trust', title: 'Communicate a Delay Without Eroding Trust', description: 'Own delays, present mitigation, offer partial value, and drive decisions', prompt: 'Communicate delay', category: 'Deadlines' },
  { id: 'protect-deep-work', title: 'Protect Deep Work Time', description: 'Set predictable availability with focus blocks and urgent paths', prompt: 'Protect deep work', category: 'Deadlines' },
  { id: 'deadline-pushback', title: 'Handle Impossible Deadline', description: 'Present options with trade-offs when deadlines risk quality or burnout', prompt: 'Handle deadline', category: 'Deadlines' },
  
  // Feedback (3)
  { id: 'close-the-loop-feedback', title: 'Close the Loop After Feedback', description: 'Make progress visible with evidence and invite continued input', prompt: 'Close feedback loop', category: 'Feedback' },
  { id: 'handle-stinging-feedback', title: 'Handle Stinging Feedback', description: 'Respond professionally to harsh feedback without defensiveness', prompt: 'Handle harsh feedback', category: 'Feedback' },
  { id: 'feedback-request', title: 'Request Performance Feedback', description: 'Make specific, low-effort, time-bound requests for actionable feedback', prompt: 'Request feedback', category: 'Feedback' },
  
  // Wellbeing (1)
  { id: 'managing-stress-triggers', title: 'Managing Stress Triggers', description: 'Protect output and health during high-stress situations with tactics and boundaries', prompt: 'Manage stress', category: 'Wellbeing' },
  
  // Team Dynamics (1)
  { id: 'decode-team-norms', title: 'Decode Team Norms', description: 'Make implicit norms explicit and propose lightweight team contract', prompt: 'Decode norms', category: 'Team Dynamics' },
];

async function seedMoments() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database');
    
    // Check if manager_moments table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'manager_moments'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ manager_moments table does not exist');
      console.log('   Run migrations first: npm run db:migrate\n');
      process.exit(1);
    }
    
    console.log('📝 Seeding moments...\n');
    
    let inserted = 0;
    let updated = 0;
    
    for (const moment of MOMENTS) {
      try {
        // Try to insert, update if exists
        const result = await client.query(`
          INSERT INTO manager_moments (id, title, description, prompt, category, tags)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) 
          DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            prompt = EXCLUDED.prompt,
            category = EXCLUDED.category,
            tags = EXCLUDED.tags
          RETURNING (xmax = 0) AS inserted
        `, [moment.id, moment.title, moment.description, moment.prompt, moment.category, JSON.stringify([])]);
        
        if (result.rows[0].inserted) {
          inserted++;
          console.log(`   ✅ Inserted: ${moment.id}`);
        } else {
          updated++;
          console.log(`   🔄 Updated: ${moment.id}`);
        }
      } catch (err) {
        console.log(`   ❌ Failed: ${moment.id} - ${err.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Seeding complete!`);
    console.log(`   📊 Inserted: ${inserted}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   📝 Total: ${MOMENTS.length}\n`);
    
    // Verify
    const count = await client.query('SELECT COUNT(*) FROM manager_moments');
    console.log(`✅ Database now has ${count.rows[0].count} moments\n`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Main execution
(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env\n');
    process.exit(1);
  }
  
  await seedMoments();
})();
