# ALT Manager - AI Career Manager for GenZ Professionals

A comprehensive AI-powered career management platform designed specifically for GenZ professionals (0-4 years experience) in India. ALT Manager provides real-time guidance, workplace support, and accountability through conversational AI and voice interaction.

## 🎯 Features

### Core Features
- **Conversational AI Manager** - Manager-style dialogue with Indian cultural understanding
- **Voice Interaction** - Speech-to-text and speech synthesis with Indian English support
- **Progress Tracking System** - Skill tracking, goals, and gamified achievements
- **Manager Moments** - Scenario-based practice for real-world work challenges
- **Onboarding Flow** - Personalized setup based on role, goals, and preferred manager tone
- **Habit Tracking** - Build micro-habits to improve professional skills

### Technical Highlights
- Mobile-first responsive design
- Real-time AI responses using Google Gemini 2.5
- Secure authentication with JWT
- PostgreSQL database with Drizzle ORM
- React Query for efficient data fetching
- Zustand for state management
- Beautiful gradient UI with Tailwind CSS

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **AI**: Google Gemini API
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the repository
```bash
cd C:\Users\maddu\CascadeProjects\alt-manager
```

### 2. Install dependencies
```bash
npm run install:all
```

This will install dependencies for the root, client, and server.

### 3. Set up environment variables

#### Server Environment (.env)
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/alt_manager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your-google-gemini-api-key

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Client Environment (optional)
Create a `.env` file in the `client` directory if you need custom API URL:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Set up the database

#### Create PostgreSQL database
```bash
createdb alt_manager
```

Or using psql:
```sql
CREATE DATABASE alt_manager;
```

#### Run migrations
```bash
cd server
npm run db:generate
npm run db:migrate
```

### 5. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `server/.env` file as `GEMINI_API_KEY`

## 🎮 Running the Application

### Development Mode

#### Run both client and server concurrently (from root):
```bash
npm run dev
```

#### Or run separately:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Production Build

#### Build both client and server:
```bash
npm run build
```

#### Start production server:
```bash
cd server
npm start
```

## 📱 Usage Guide

### First Time Setup

1. **Register**: Create an account with email and password
2. **Onboarding**: Complete the 3-step onboarding process:
   - Step 1: Enter your role and years of experience
   - Step 2: Define your career goals and challenges
   - Step 3: Choose your preferred manager tone (Supportive, Direct, or Balanced)

### Main Features

#### 1. Home Dashboard
- Quick access to all features
- View your current level and XP
- Track active skills and goals
- Get daily manager tips

#### 2. Chat with AI Manager
- Start conversations for career guidance
- Use voice input for hands-free interaction
- Get personalized advice based on your profile
- Access conversation history

#### 3. Manager Moments
- Practice workplace scenarios
- Get AI-powered feedback on your responses
- Learn from strengths and improvement areas
- Apply frameworks and micro-habits

#### 4. Progress Tracking
- **Skills**: Track and monitor skill development
- **Goals**: Set and achieve career goals
- **Achievements**: Earn badges and trophies
- **Habits**: Build daily micro-habits

## 🗄️ Database Schema

### Main Tables
- `users` - User accounts and authentication
- `user_profiles` - User profile data and preferences
- `skills` - Skill tracking with progress
- `goals` - Career goals with completion tracking
- `achievements` - Earned badges and trophies
- `conversations` - Chat conversation threads
- `messages` - Individual chat messages
- `manager_moments` - Scenario-based practice content
- `user_moments` - User progress on moments
- `habits` - Micro-habits tracking
- `saved_recommendations` - Bookmarked advice

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection protection via Drizzle ORM

## 🎨 UI/UX Features

- Mobile-first responsive design
- Progressive reveal (no information overload)
- Button-first interactions
- GenZ-friendly tone and modern gradients
- Smooth animations and transitions
- Voice input support
- Accessible design (WCAG compliant)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/name` - Update user name

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Manager Moments
- `GET /api/moments` - Get all moments
- `GET /api/moments/progress` - Get user progress
- `POST /api/moments/:id/start` - Start a moment
- `POST /api/moments/:id/submit` - Submit response

### Achievements
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements` - Create achievement

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `POST /api/habits/:id/complete` - Mark habit complete
- `DELETE /api/habits/:id` - Delete habit

## 🧪 Testing

The application includes:
- Input validation on all forms
- Error handling with user-friendly messages
- Loading states for async operations
- Optimistic updates where appropriate

## 🚢 Deployment

### Recommended Platforms

**Frontend:**
- Vercel
- Netlify
- Render

**Backend:**
- Render
- Railway
- Heroku
- DigitalOcean

**Database:**
- Supabase (PostgreSQL)
- Neon
- Railway
- AWS RDS

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure proper `DATABASE_URL`
- Set correct `CORS_ORIGIN`
- Add valid `GEMINI_API_KEY`

## 🔧 Troubleshooting

### Common Issues

**Database connection fails:**
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

**AI responses not working:**
- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Review server logs for errors

**Voice input not working:**
- Voice recognition requires HTTPS in production
- Check browser compatibility (Chrome/Edge recommended)
- Ensure microphone permissions are granted

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (v18+)
- Verify all dependencies are installed

## 📝 Development Notes

### Adding New Manager Moments

To add practice scenarios, insert data into the `manager_moments` table:

```sql
INSERT INTO manager_moments (title, description, scenario, artifact, category, difficulty, learning_objectives)
VALUES (
  'Handling Difficult Feedback',
  'Learn to receive and respond to constructive criticism',
  'Your manager has scheduled a 1:1 to discuss your recent project...',
  '{"type": "email", "content": "..."}',
  'Communication',
  2,
  '["Active listening", "Emotional regulation", "Growth mindset"]'
);
```

### Customizing AI Behavior

Edit `server/src/services/ai.service.ts` to modify:
- System prompts
- Tone instructions
- Evaluation criteria
- Response formatting

## 🤝 Contributing

This is a proprietary project. For contributions or questions, please contact the development team.

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For support, please contact:
- Email: support@altmanager.com
- Documentation: https://docs.altmanager.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core chat functionality
- ✅ Manager Moments
- ✅ Progress tracking
- ✅ Onboarding flow

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] Team features
- [ ] Advanced analytics
- [ ] Integration with Slack/Teams
- [ ] Calendar integration
- [ ] More Manager Moments scenarios

### Phase 3 (Future)
- [ ] AI voice calls
- [ ] Career path recommendations
- [ ] Peer comparison (anonymous)
- [ ] Industry-specific content
- [ ] Multi-language support

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- React and TypeScript communities
- Open source contributors

---

**Built with ❤️ for GenZ professionals in India**
