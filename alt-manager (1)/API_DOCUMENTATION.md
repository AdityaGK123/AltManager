# API Documentation

Base URL: `http://localhost:3000/api` (development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Email and password required
- `400` - User already exists

---

### Login User
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400` - Email and password required
- `401` - Invalid credentials

---

## User Endpoints

### Get User Profile
**GET** `/user/profile`

Get current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "profile": {
    "roleTitle": "Software Engineer",
    "experienceYears": 2,
    "careerGoals": "Get promoted to Senior Engineer",
    "currentChallenges": "Improving communication skills",
    "managerTone": "balanced",
    "onboardingCompleted": true,
    "level": 5,
    "experiencePoints": 1250
  }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found

---

### Update User Profile
**PUT** `/user/profile`

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "roleTitle": "Senior Software Engineer",
  "experienceYears": 3,
  "careerGoals": "Lead a team",
  "currentChallenges": "Time management",
  "managerTone": "direct",
  "onboardingCompleted": true
}
```

**Response:** `200 OK`
```json
{
  "profile": {
    "id": 1,
    "userId": 1,
    "roleTitle": "Senior Software Engineer",
    "experienceYears": 3,
    "careerGoals": "Lead a team",
    "currentChallenges": "Time management",
    "managerTone": "direct",
    "onboardingCompleted": true,
    "level": 5,
    "experiencePoints": 1250,
    "updatedAt": "2025-10-11T05:19:01.000Z"
  }
}
```

---

## Chat Endpoints

### Get Conversations
**GET** `/chat/conversations`

Get all conversations for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "id": 1,
      "userId": 1,
      "title": "Career Guidance",
      "createdAt": "2025-10-11T05:00:00.000Z",
      "updatedAt": "2025-10-11T05:30:00.000Z"
    }
  ]
}
```

---

### Create Conversation
**POST** `/chat/conversations`

Create a new conversation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Conversation"
}
```

**Response:** `201 Created`
```json
{
  "conversation": {
    "id": 2,
    "userId": 1,
    "title": "New Conversation",
    "createdAt": "2025-10-11T05:45:00.000Z",
    "updatedAt": "2025-10-11T05:45:00.000Z"
  }
}
```

---

### Get Messages
**GET** `/chat/conversations/:id/messages`

Get all messages in a conversation.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": 1,
      "conversationId": 1,
      "role": "user",
      "content": "How can I improve my communication skills?",
      "createdAt": "2025-10-11T05:10:00.000Z"
    },
    {
      "id": 2,
      "conversationId": 1,
      "role": "assistant",
      "content": "Great question! Here are some practical steps...",
      "createdAt": "2025-10-11T05:10:05.000Z"
    }
  ]
}
```

**Errors:**
- `404` - Conversation not found

---

### Send Message
**POST** `/chat/conversations/:id/messages`

Send a message and get AI response.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "How can I improve my communication skills?"
}
```

**Response:** `200 OK`
```json
{
  "userMessage": {
    "id": 3,
    "conversationId": 1,
    "role": "user",
    "content": "How can I improve my communication skills?",
    "createdAt": "2025-10-11T05:15:00.000Z"
  },
  "assistantMessage": {
    "id": 4,
    "conversationId": 1,
    "role": "assistant",
    "content": "Here are some practical steps to improve...",
    "createdAt": "2025-10-11T05:15:02.000Z"
  }
}
```

**Errors:**
- `400` - Message content required
- `404` - Conversation not found

---

## Skills Endpoints

### Get Skills
**GET** `/skills`

Get all skills for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "skills": [
    {
      "id": 1,
      "userId": 1,
      "name": "Public Speaking",
      "category": "Communication",
      "currentLevel": 30,
      "targetLevel": 80,
      "progress": 37,
      "createdAt": "2025-10-11T05:00:00.000Z",
      "updatedAt": "2025-10-11T05:00:00.000Z"
    }
  ]
}
```

---

### Create Skill
**POST** `/skills`

Create a new skill to track.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Public Speaking",
  "category": "Communication",
  "currentLevel": 30,
  "targetLevel": 80
}
```

**Response:** `201 Created`
```json
{
  "skill": {
    "id": 1,
    "userId": 1,
    "name": "Public Speaking",
    "category": "Communication",
    "currentLevel": 30,
    "targetLevel": 80,
    "progress": 0,
    "createdAt": "2025-10-11T05:00:00.000Z",
    "updatedAt": "2025-10-11T05:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Skill name required

---

### Update Skill
**PUT** `/skills/:id`

Update a skill's information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentLevel": 50,
  "progress": 62
}
```

**Response:** `200 OK`
```json
{
  "skill": {
    "id": 1,
    "userId": 1,
    "name": "Public Speaking",
    "category": "Communication",
    "currentLevel": 50,
    "targetLevel": 80,
    "progress": 62,
    "updatedAt": "2025-10-11T06:00:00.000Z"
  }
}
```

**Errors:**
- `404` - Skill not found

---

### Delete Skill
**DELETE** `/skills/:id`

Delete a skill.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Errors:**
- `404` - Skill not found

---

## Goals Endpoints

### Get Goals
**GET** `/goals`

Get all goals for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "goals": [
    {
      "id": 1,
      "userId": 1,
      "title": "Get promoted to Senior Engineer",
      "description": "Demonstrate leadership and technical excellence",
      "targetDate": "2025-12-31T00:00:00.000Z",
      "completed": false,
      "progress": 45,
      "createdAt": "2025-10-11T05:00:00.000Z",
      "updatedAt": "2025-10-11T05:00:00.000Z"
    }
  ]
}
```

---

### Create Goal
**POST** `/goals`

Create a new goal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Get promoted to Senior Engineer",
  "description": "Demonstrate leadership and technical excellence",
  "targetDate": "2025-12-31"
}
```

**Response:** `201 Created`
```json
{
  "goal": {
    "id": 1,
    "userId": 1,
    "title": "Get promoted to Senior Engineer",
    "description": "Demonstrate leadership and technical excellence",
    "targetDate": "2025-12-31T00:00:00.000Z",
    "completed": false,
    "progress": 0,
    "createdAt": "2025-10-11T05:00:00.000Z",
    "updatedAt": "2025-10-11T05:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Goal title required

---

### Update Goal
**PUT** `/goals/:id`

Update a goal's information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "progress": 60,
  "completed": false
}
```

**Response:** `200 OK`
```json
{
  "goal": {
    "id": 1,
    "userId": 1,
    "title": "Get promoted to Senior Engineer",
    "progress": 60,
    "completed": false,
    "updatedAt": "2025-10-11T06:00:00.000Z"
  }
}
```

---

## Manager Moments Endpoints

### Get All Moments
**GET** `/moments`

Get all available manager moments.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "moments": [
    {
      "id": 1,
      "title": "Handling Unclear Requirements",
      "description": "Learn to navigate ambiguous project requirements",
      "scenario": "You've been assigned a new feature...",
      "artifact": { "type": "slack", "message": "..." },
      "category": "Communication",
      "difficulty": 1,
      "learningObjectives": ["Asking clarifying questions", "..."],
      "createdAt": "2025-10-11T05:00:00.000Z"
    }
  ]
}
```

---

### Get User Progress
**GET** `/moments/progress`

Get user's progress on all moments.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "progress": [
    {
      "id": 1,
      "userId": 1,
      "momentId": 1,
      "status": "completed",
      "score": 85,
      "feedback": {
        "score": 85,
        "strengths": ["Clear communication", "..."],
        "improvements": ["Could be more specific", "..."],
        "examples": ["Try asking: 'What metrics...'", "..."]
      },
      "completedAt": "2025-10-11T05:30:00.000Z"
    }
  ]
}
```

---

### Start Moment
**POST** `/moments/:id/start`

Start practicing a manager moment.

**Headers:** `Authorization: Bearer <token>`

**Response:** `201 Created`
```json
{
  "userMoment": {
    "id": 1,
    "userId": 1,
    "momentId": 1,
    "status": "in_progress",
    "score": null,
    "feedback": null,
    "createdAt": "2025-10-11T05:20:00.000Z"
  }
}
```

---

### Submit Moment Response
**POST** `/moments/:id/submit`

Submit response for evaluation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "response": "I would start by asking my manager to clarify..."
}
```

**Response:** `200 OK`
```json
{
  "userMoment": {
    "id": 1,
    "userId": 1,
    "momentId": 1,
    "status": "completed",
    "score": 85,
    "feedback": {
      "score": 85,
      "strengths": ["Clear communication", "Proactive approach"],
      "improvements": ["Could be more specific", "Add timeline"],
      "examples": ["Try: 'What metrics should I prioritize?'"]
    },
    "completedAt": "2025-10-11T05:30:00.000Z"
  },
  "evaluation": {
    "score": 85,
    "strengths": ["Clear communication", "Proactive approach"],
    "improvements": ["Could be more specific", "Add timeline"],
    "examples": ["Try: 'What metrics should I prioritize?'"]
  }
}
```

**Errors:**
- `400` - Response required
- `404` - Moment not found

---

## Habits Endpoints

### Get Habits
**GET** `/habits`

Get all habits for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "habits": [
    {
      "id": 1,
      "userId": 1,
      "title": "Review daily priorities",
      "description": "Spend 5 minutes each morning",
      "frequency": "daily",
      "streak": 7,
      "lastCompletedAt": "2025-10-11T05:00:00.000Z",
      "createdAt": "2025-10-04T05:00:00.000Z"
    }
  ]
}
```

---

### Create Habit
**POST** `/habits`

Create a new habit to track.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Review daily priorities",
  "description": "Spend 5 minutes each morning",
  "frequency": "daily"
}
```

**Response:** `201 Created`
```json
{
  "habit": {
    "id": 1,
    "userId": 1,
    "title": "Review daily priorities",
    "description": "Spend 5 minutes each morning",
    "frequency": "daily",
    "streak": 0,
    "createdAt": "2025-10-11T05:00:00.000Z"
  }
}
```

---

### Complete Habit
**POST** `/habits/:id/complete`

Mark habit as completed for today.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "habit": {
    "id": 1,
    "userId": 1,
    "title": "Review daily priorities",
    "streak": 8,
    "lastCompletedAt": "2025-10-11T05:00:00.000Z",
    "updatedAt": "2025-10-11T05:00:00.000Z"
  }
}
```

---

## Achievements Endpoints

### Get Achievements
**GET** `/achievements`

Get all achievements earned by the user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "achievements": [
    {
      "id": 1,
      "userId": 1,
      "title": "First Conversation",
      "description": "Started your first chat with the AI manager",
      "tier": "bronze",
      "icon": "message-circle",
      "earnedAt": "2025-10-11T05:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Authentication endpoints are rate limited:
- **Window**: 15 minutes
- **Max Requests**: 5 per window

Response headers include:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1696996800
```

---

## Health Check

### Check API Health
**GET** `/health`

Check if the API is running.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T05:19:01.000Z"
}
```

---

**Last Updated**: October 11, 2025
