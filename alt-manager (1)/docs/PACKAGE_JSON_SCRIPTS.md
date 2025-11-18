# Package.json Scripts for Chat Optimization

Add these scripts to your `package.json` for easy management:

```json
{
  "scripts": {
    "chat:migrate": "node server/src/db/run-migration.js server/src/db/migrations/optimize_chat_storage.sql",
    "chat:lifecycle": "npx tsx server/src/scripts/chat-lifecycle-manager.ts",
    "chat:lifecycle:dry": "LIFECYCLE_DRY_RUN=true npx tsx server/src/scripts/chat-lifecycle-manager.ts",
    "chat:monitor": "npx tsx server/src/scripts/chat-storage-monitor.ts",
    "chat:verify": "node server/src/db/verify-moments-complete.js"
  }
}
```

## Usage

### Run Migration
```bash
npm run chat:migrate
```

### Test Lifecycle Manager (Dry Run)
```bash
npm run chat:lifecycle:dry
```

### Run Lifecycle Manager (Production)
```bash
npm run chat:lifecycle
```

### Monitor Storage
```bash
npm run chat:monitor
```

### Verify Setup
```bash
npm run chat:verify
```

## Cron Job Setup

### Linux/Mac (crontab)
```bash
# Edit crontab
crontab -e

# Add these lines
0 2 * * * cd /path/to/alt-manager && npm run chat:lifecycle >> /var/log/chat-lifecycle.log 2>&1
0 9 * * 1 cd /path/to/alt-manager && npm run chat:monitor >> /var/log/chat-monitor.log 2>&1
```

### Windows (Task Scheduler)
```powershell
# Create scheduled task for lifecycle manager
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run chat:lifecycle" -WorkingDirectory "C:\path\to\alt-manager"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "ChatLifecycleManager" -Description "Daily chat data archival"

# Create scheduled task for monitoring
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run chat:monitor" -WorkingDirectory "C:\path\to\alt-manager"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "ChatStorageMonitor" -Description "Weekly storage monitoring"
```

### Docker (docker-compose.yml)
```yaml
services:
  chat-lifecycle:
    image: node:18-alpine
    volumes:
      - ./server:/app/server
      - ./package.json:/app/package.json
    working_dir: /app
    command: sh -c "npm install && npm run chat:lifecycle"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - LIFECYCLE_DRY_RUN=false
    restart: "no"
    # Run via cron or orchestrator
```

## Environment Variables

Create a `.env` file in the server directory:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Lifecycle Manager
LIFECYCLE_DRY_RUN=false
LIFECYCLE_ARCHIVE_DAYS=180
LIFECYCLE_DELETE_DAYS=365
LIFECYCLE_BATCH_SIZE=1000

# Cache (optional)
REDIS_URL=redis://localhost:6379

# Monitoring
ALERT_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Chat Lifecycle

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  lifecycle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run chat:lifecycle
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### GitLab CI
```yaml
chat-lifecycle:
  image: node:18-alpine
  script:
    - npm install
    - npm run chat:lifecycle
  only:
    - schedules
  variables:
    DATABASE_URL: $DATABASE_URL
```

## Monitoring Integration

### Prometheus Metrics
Add to your monitoring endpoint:

```typescript
// server/src/routes/metrics.ts
router.get('/metrics', async (req, res) => {
  const stats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_conversations,
      COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as archived_conversations,
      SUM(message_count) as total_messages,
      pg_database_size(current_database()) as db_size_bytes
    FROM conversations
  `);
  
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP chat_conversations_total Total number of conversations
# TYPE chat_conversations_total gauge
chat_conversations_total ${stats.rows[0].total_conversations}

# HELP chat_conversations_archived Archived conversations
# TYPE chat_conversations_archived gauge
chat_conversations_archived ${stats.rows[0].archived_conversations}

# HELP chat_messages_total Total number of messages
# TYPE chat_messages_total gauge
chat_messages_total ${stats.rows[0].total_messages}

# HELP chat_db_size_bytes Database size in bytes
# TYPE chat_db_size_bytes gauge
chat_db_size_bytes ${stats.rows[0].db_size_bytes}
  `);
});
```

### Grafana Dashboard
Import the provided dashboard JSON:
- Conversations over time
- Storage growth trend
- Query latency (p50, p95, p99)
- Cache hit rate
- Cost estimation

---

**Note:** Adjust paths and schedules based on your deployment environment.
