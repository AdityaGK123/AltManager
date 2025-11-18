# Quick Fix for 500 Error

## Problem
The analysis.service.ts file was corrupted during editing, causing TypeScript compilation errors and 500 server errors.

## Solution

### Step 1: Stop the server
```bash
# Kill all node processes
taskkill /F /IM node.exe
```

### Step 2: Restore the file
If you have git/version control:
```bash
cd server
git checkout src/services/analysis.service.ts
```

If you don't have version control, download the original file from your project backup or recreate it.

### Step 3: Apply ONLY these minimal changes

In `server/src/services/mom.service.ts`, line 23:
Change from:
```typescript
return messageCount.length >= 4; // At least 2 user messages + 2 AI responses
```
To:
```typescript
return messageCount.length >= 2; // At least 1 user message + 1 AI response
```

In `server/src/services/auto-analysis.service.ts`, lines 11-13:
Change from:
```typescript
private readonly MIN_MOMS_FOR_TRENDS = 3;
private readonly MIN_MOMS_FOR_BLINDSPOTS = 3;
private readonly ANALYSIS_COOLDOWN_HOURS = 24;
```
To:
```typescript
private readonly MIN_MOMS_FOR_TRENDS = 1;
private readonly MIN_MOMS_FOR_BLINDSPOTS = 1;
private readonly ANALYSIS_COOLDOWN_HOURS = 1;
```

### Step 4: Restart server
```bash
cd server
npm run dev
```

### Step 5: Test
1. Go to /chat
2. Send a message
3. Wait for response
4. Click "End Chat & Generate MoM"
5. Check Analytics page

## What We Changed
- Reduced message threshold from 4 to 2 messages
- Reduced analysis requirements from 3 to 1 MoM
- Reduced cooldown from 24 hours to 1 hour

These changes make MoMs and analytics generate immediately after your first conversation!
