# Chat Storage Optimization - Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Conversation │  │   Message    │  │   Infinite   │         │
│  │     List     │  │    Thread    │  │    Scroll    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Pagination Middleware                       │  │
│  │  • Parse limit/cursor params                            │  │
│  │  • Validate ranges (max 100 per page)                   │  │
│  │  • Generate next/prev cursors                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Authentication Layer                        │  │
│  │  • JWT validation                                        │  │
│  │  • User context injection                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────────┐  ┌────────────────────────────┐
│     CACHE LAYER           │  │    DATABASE LAYER          │
│   (Redis / In-Memory)     │  │   (PostgreSQL - Neon)      │
│                           │  │                            │
│  ┌─────────────────────┐ │  │  ┌──────────────────────┐  │
│  │  Hot Data (TTL)     │ │  │  │  conversations       │  │
│  │  • conversations    │ │  │  │  • Indexed by user   │  │
│  │  • messages         │ │  │  │  • Partitioned       │  │
│  │  • user profiles    │ │  │  └──────────────────────┘  │
│  └─────────────────────┘ │  │                            │
│                           │  │  ┌──────────────────────┐  │
│  TTL Strategy:            │  │  │  messages            │  │
│  • Conversations: 5min    │  │  │  • Indexed by conv   │  │
│  • Messages: 2min         │  │  │  • Cursor-optimized  │  │
│  • Profiles: 30min        │  │  └──────────────────────┘  │
│                           │  │                            │
│  Cache Invalidation:      │  │  ┌──────────────────────┐  │
│  • On new message         │  │  │  Archived Data       │  │
│  • On delete              │  │  │  • 6+ months old     │  │
│  • Pattern-based          │  │  │  • Read-only         │  │
│                           │  │  └──────────────────────┘  │
└───────────────────────────┘  └────────────────────────────┘
```

## Data Flow - Send Message

```
┌─────────┐
│ User    │
│ Client  │
└────┬────┘
     │ POST /conversations/:id/messages
     │ { content: "Hello" }
     ▼
┌─────────────────────────────────────┐
│  API: Validate & Authenticate       │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Check Cache: conversation owner    │
│  Key: conversation:{id}:owner       │
└────┬────────────────────────────────┘
     │
     ├─ Cache Hit ──────────────┐
     │                          │
     └─ Cache Miss ─────────┐   │
                            ▼   │
     ┌──────────────────────────┴───┐
     │  DB: Query conversation      │
     │  Cache result (1h TTL)       │
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  DB: Insert user message     │
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  Get conversation history    │
     │  (last 20 messages)          │
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  AI Service: Generate reply  │
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  DB: Insert AI message       │
     │  Update conversation.updated │
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  Invalidate Caches:          │
     │  • messages:{id}:*           │
     │  • conversations:{user}:*    │
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  Return: userMessage +       │
     │          assistantMessage    │
     └──────────────────────────────┘
```

## Data Flow - Load Messages (Paginated)

```
┌─────────┐
│ User    │
│ Client  │
└────┬────┘
     │ GET /conversations/:id/messages?limit=50&cursor=123
     ▼
┌─────────────────────────────────────┐
│  API: Parse pagination params       │
│  • limit: 50 (max 100)              │
│  • cursor: 123                      │
│  • direction: forward               │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Check Cache                        │
│  Key: messages:{id}:123:forward     │
└────┬────────────────────────────────┘
     │
     ├─ Cache Hit (80% of requests) ──┐
     │                                 │
     └─ Cache Miss (20%) ──────────┐   │
                                   ▼   │
     ┌──────────────────────────────┴──┴┐
     │  DB Query:                        │
     │  SELECT * FROM messages           │
     │  WHERE conversation_id = :id      │
     │    AND id > :cursor               │
     │  ORDER BY id ASC                  │
     │  LIMIT 51                         │
     │                                   │
     │  Uses Index:                      │
     │  idx_messages_conv_id_created     │
     └──────────────┬────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │  Process Results:                │
     │  • Check hasMore (51 results?)   │
     │  • Slice to 50 messages          │
     │  • Calculate nextCursor          │
     └──────────────┬───────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │  Cache Result (2min TTL)         │
     │  Key: messages:{id}:123:forward  │
     └──────────────┬───────────────────┘
                    │
                    ▼
     ┌──────────────────────────────────┐
     │  Return:                         │
     │  {                               │
     │    messages: [...],              │
     │    pagination: {                 │
     │      nextCursor: 173,            │
     │      hasMore: true,              │
     │      limit: 50                   │
     │    }                             │
     │  }                               │
     └──────────────────────────────────┘
```

## Lifecycle Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    CRON JOB (Daily 2 AM)                     │
│              chat-lifecycle-manager.ts                       │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Archive Old Conversations                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SELECT id FROM conversations                         │  │
│  │  WHERE updated_at < NOW() - INTERVAL '180 days'      │  │
│  │    AND archived_at IS NULL                           │  │
│  │    AND deleted_at IS NULL                            │  │
│  │                                                       │  │
│  │  UPDATE conversations                                │  │
│  │  SET archived_at = NOW()                             │  │
│  │  WHERE id IN (...)                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Soft Delete Very Old Conversations                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UPDATE conversations                                │  │
│  │  SET deleted_at = NOW()                              │  │
│  │  WHERE created_at < NOW() - INTERVAL '365 days'     │  │
│  │    AND deleted_at IS NULL                            │  │
│  └───────────────────────────────────────────────────────┘  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Archive Messages from Archived Conversations      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UPDATE messages m                                   │  │
│  │  SET archived_at = NOW()                             │  │
│  │  FROM conversations c                                │  │
│  │  WHERE m.conversation_id = c.id                      │  │
│  │    AND c.archived_at IS NOT NULL                     │  │
│  │    AND m.archived_at IS NULL                         │  │
│  │  LIMIT 1000  -- Process in batches                   │  │
│  └───────────────────────────────────────────────────────┘  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Delete Messages from Deleted Conversations        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  DELETE FROM messages                                │  │
│  │  WHERE conversation_id IN (                          │  │
│  │    SELECT id FROM conversations                      │  │
│  │    WHERE deleted_at IS NOT NULL                      │  │
│  │  )                                                    │  │
│  │  LIMIT 1000  -- Process in batches                   │  │
│  └───────────────────────────────────────────────────────┘  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Optimize Database                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  VACUUM ANALYZE conversations;                       │  │
│  │  VACUUM ANALYZE messages;                            │  │
│  │                                                       │  │
│  │  Reclaims disk space from deleted rows               │  │
│  └───────────────────────────────────────────────────────┘  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Report Results:                                            │
│  • Conversations archived: 234                              │
│  • Conversations deleted: 45                                │
│  • Messages archived: 12,456                                │
│  • Messages deleted: 3,421                                  │
│  • Errors: 0                                                │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Evolution

### Before Optimization
```sql
conversations
├── id (PK)
├── user_id (FK)
├── title
├── created_at
└── updated_at

messages
├── id (PK)
├── conversation_id (FK)
├── role
├── content
├── metadata
└── created_at
```

### After Optimization
```sql
conversations
├── id (PK)
├── user_id (FK) ◄─── INDEXED
├── title
├── message_count ◄─── NEW (cached)
├── last_message_at ◄─── NEW (cached)
├── archived_at ◄─── NEW (lifecycle)
├── deleted_at ◄─── NEW (soft delete)
├── created_at ◄─── INDEXED
└── updated_at ◄─── INDEXED

messages
├── id (PK)
├── conversation_id (FK) ◄─── INDEXED
├── role
├── content
├── metadata
├── archived_at ◄─── NEW (lifecycle)
└── created_at ◄─── INDEXED (composite)

Indexes Added:
• idx_conversations_user_id
• idx_conversations_user_created (composite)
• idx_conversations_updated
• idx_messages_conversation_id
• idx_messages_conversation_created (composite)
• idx_messages_conv_id_created (pagination)
```

## Cost Optimization Timeline

```
Month 0 (Before)
├── Storage: 1 GB
├── Cost: $20/month
└── Growth: +1 GB/month

Month 1 (Migration)
├── Run optimization migration
├── Deploy caching layer
└── Enable lifecycle manager

Month 2-6 (Stabilization)
├── Storage: 1.5 GB → 2 GB
├── Archival starts at month 6
├── Cost: $15/month (25% savings)
└── Cache hit rate: 80%

Month 7+ (Steady State)
├── Storage: 2 GB (stable)
├── Archival removes old data
├── Cost: $8/month (60% savings)
└── Performance: 5x faster

Annual Projection:
┌────────────────────────────────────┐
│  Without Optimization: $240/year  │
│  With Optimization:    $96/year   │
│  ─────────────────────────────────│
│  Savings:              $144/year  │
│  ROI:                  60%        │
└────────────────────────────────────┘
```

## Monitoring Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    CHAT STORAGE DASHBOARD                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Total Storage    │  │ Monthly Cost     │               │
│  │   2.04 GB        │  │   $8.12          │               │
│  │   ▲ 0.3 GB/mo    │  │   ▼ 60% savings  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Cache Hit Rate   │  │ Query Latency    │               │
│  │   82%            │  │   45ms (p95)     │               │
│  │   ✅ Target: 80% │  │   ✅ Target: 50ms│               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Storage Growth Over Time                    │   │
│  │  3GB ┤                                              │   │
│  │  2GB ┤         ╱─────────────                       │   │
│  │  1GB ┤    ╱───╱                                     │   │
│  │  0GB └────────────────────────────────────────────  │   │
│  │       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Active vs Archived Data                     │   │
│  │  ████████████████ Active (65%)                      │   │
│  │  ██████████ Archived (30%)                          │   │
│  │  ██ Deleted (5%)                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Top Users by Storage                        │   │
│  │  1. User 42    │ 234 convos │ 12.4k msgs │ 145 MB  │   │
│  │  2. User 17    │ 189 convos │ 9.8k msgs  │ 112 MB  │   │
│  │  3. User 91    │ 156 convos │ 8.2k msgs  │ 98 MB   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ◄─── : Optimized/Indexed
- NEW : Added in optimization
- FK : Foreign Key
- PK : Primary Key
