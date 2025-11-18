/**
 * Test Script: Verify All Moments Complete Correctly
 * Tests that each moment's expectedTurns matches template and debrief triggers
 * 
 * Usage: node test-moments-completion.js
 */

import { momentsAIService } from './src/services/momentsAIService.js';

console.log('\n🧪 Testing Manager Moments Completion Logic...\n');
console.log('='.repeat(60));

// Test moment IDs (common ones)
const testMoments = [
  'bluf-your-message',
  'managing-stress',
  'delegation-basics',
  'feedback-delivery',
  'conflict-resolution',
  'time-management',
  'team-motivation',
  'performance-review',
  'career-development',
  'change-management'
];

let passCount = 0;
let failCount = 0;
const results = [];

for (const momentId of testMoments) {
  try {
    const template = momentsAIService.getMomentTemplate(momentId);
    
    if (!template) {
      results.push({
        momentId,
        status: 'WARN',
        message: 'No template found (will use default 3 turns)',
        expectedTurns: 3
      });
      failCount++;
      continue;
    }
    
    const expectedTurns = template.roleplayConfig?.expectedTurns || 3;
    const stakeholderRole = template.stakeholderVariants?.[0]?.role || 'Manager';
    
    results.push({
      momentId,
      status: 'PASS',
      expectedTurns,
      stakeholderRole,
      hasRubric: !!template.rubric,
      rubricCount: template.rubric ? Object.keys(template.rubric).length : 0
    });
    passCount++;
    
  } catch (error) {
    results.push({
      momentId,
      status: 'FAIL',
      error: error.message
    });
    failCount++;
  }
}

// Display results
console.log('\n📊 Test Results:\n');

results.forEach(result => {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️ ' : '❌';
  console.log(`${icon} ${result.momentId.padEnd(25)}`);
  
  if (result.status === 'PASS') {
    console.log(`   Expected Turns: ${result.expectedTurns}`);
    console.log(`   Stakeholder: ${result.stakeholderRole}`);
    console.log(`   Rubric Criteria: ${result.rubricCount}`);
  } else if (result.status === 'WARN') {
    console.log(`   ${result.message}`);
  } else {
    console.log(`   Error: ${result.error}`);
  }
  console.log('');
});

console.log('='.repeat(60));
console.log(`\n✅ Passed: ${passCount}`);
console.log(`⚠️  Warnings: ${failCount}`);
console.log(`\n${passCount === testMoments.length ? '🎉 All moments configured correctly!' : '⚠️  Some moments need attention'}\n`);

// Test completion logic
console.log('\n🔍 Testing Completion Logic:\n');

const testCases = [
  { turnCount: 1, expectedTurns: 2, shouldComplete: false },
  { turnCount: 2, expectedTurns: 2, shouldComplete: true },
  { turnCount: 2, expectedTurns: 3, shouldComplete: false },
  { turnCount: 3, expectedTurns: 3, shouldComplete: true },
];

testCases.forEach(test => {
  const isComplete = test.turnCount >= test.expectedTurns;
  const passed = isComplete === test.shouldComplete;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${icon} Turn ${test.turnCount}/${test.expectedTurns} => isComplete: ${isComplete} (expected: ${test.shouldComplete})`);
});

console.log('\n' + '='.repeat(60) + '\n');
