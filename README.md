# 📧 ReachInbox - Email Aggregator with AI Categorization & RAG

A comprehensive email aggregator system that synchronizes multiple IMAP accounts in real-time, categorizes emails using AI, and provides intelligent reply suggestions using RAG (Retrieval-Augmented Generation).

## 🌟 Features

### ✅ Implemented Features

1. **Real-Time Email Synchronization**
   - Syncs multiple IMAP accounts using persistent connections (IDLE mode)
   - Fetches last 30 days of emails on startup
   - Real-time updates for new incoming emails
   - Automatic reconnection on connection loss

2. **Searchable Storage with Elasticsearch**
   - Locally hosted Elasticsearch instance via Docker
   - Full-text search across email subject and body
   - Filter by account, folder, and category
   - Efficient indexing and retrieval

3. **AI-Based Email Categorization**
   - Automatic categorization using OpenAI GPT-4
   - Categories: Interested, Meeting Booked, Not Interested, Spam, Out of Office
   - Manual recategorization option
   - Batch processing support

4. **Slack & Webhook Integration**
   - Slack notifications for "Interested" emails
   - Webhook triggers for external automation
   - Rich message formatting with email details

5. **Frontend Interface**
   - Clean, responsive UI built with Next.js
   - Email list with real-time filtering
   - Detailed email viewer
   - Search functionality
   - Filter by account, folder, and category

6. **AI-Powered Suggested Replies (RAG)**
   - Vector database using PostgreSQL with pgvector
   - Stores training data and context
   - LLM-powered reply suggestions
   - Context-aware responses with meeting booking links
   - Confidence scoring

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  - React Components   - Filters   - Email Viewer            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Backend (Node.js + Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ IMAP Service │  │  AI Service  │  │ Vector DB    │      │
│  │ (IDLE mode)  │  │  (OpenAI)    │  │ (pgvector)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Elasticsearch │  │    Slack     │  │   Webhook    │      │
│  │   Service    │  │ Integration  │  │ Integration  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Docker Services                            │
│  - Elasticsearch (Port 9200)                                │
│  - PostgreSQL with pgvector (Port 5432)                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Gmail accounts with App Passwords (or other IMAP accounts)
- OpenAI API Key
- Slack Webhook URL (optional)
- Webhook.site URL (optional)

### Installation Steps

1. **Clone and Install Dependencies**

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

2. **Start Docker Services**

```bash
# Start Elasticsearch and PostgreSQL
npm run docker:up

# Wait for services to be ready (30-60 seconds)
# Verify: http://localhost:9200 should return Elasticsearch info
```

3. **Configure Environment Variables**

Create `backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# IMAP Account 1 (Gmail example)
IMAP1_USER=your-email1@gmail.com
IMAP1_PASSWORD=your-16-char-app-password
IMAP1_HOST=imap.gmail.com
IMAP1_PORT=993
IMAP1_TLS=true

# IMAP Account 2
IMAP2_USER=your-email2@gmail.com
IMAP2_PASSWORD=your-16-char-app-password
IMAP2_HOST=imap.gmail.com
IMAP2_PORT=993
IMAP2_TLS=true

# Slack Integration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Webhook Integration (optional - get from webhook.site)
WEBHOOK_URL=https://webhook.site/your-unique-url

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# PostgreSQL Vector Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=email_vectordb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# RAG Configuration
MEETING_LINK=https://cal.com/your-username
OUTREACH_CONTEXT=I am applying for a job position. If the lead is interested, share the meeting booking link.
```

Create `.env.local` in root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Generate Gmail App Passwords**

For Gmail accounts:
- Go to Google Account settings
- Enable 2-Factor Authentication
- Go to Security > App Passwords
- Generate a new app password for "Mail"
- Use the 16-character password in IMAP_PASSWORD

5. **Start the Application**

```bash
# Option 1: Start both backend and frontend
npm run dev

# Option 2: Start separately
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev:frontend
```

6. **Access the Application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Elasticsearch: http://localhost:9200

## 📚 API Documentation

### Email Endpoints

#### GET `/api/emails`
Get emails with optional filters
```bash
curl "http://localhost:3001/api/emails?account=email@example.com&category=Interested&limit=10"
```

#### GET `/api/emails/:id`
Get single email by ID
```bash
curl "http://localhost:3001/api/emails/{emailId}"
```

#### POST `/api/emails/search`
Search emails with query
```bash
curl -X POST http://localhost:3001/api/emails/search \
  -H "Content-Type: application/json" \
  -d '{"query": "interview", "category": "Interested"}'
```

#### PATCH `/api/emails/:id/category`
Update email category
```bash
curl -X PATCH http://localhost:3001/api/emails/{emailId}/category \
  -H "Content-Type: application/json" \
  -d '{"category": "Interested"}'
```

#### POST `/api/emails/:id/recategorize`
Recategorize email with AI
```bash
curl -X POST http://localhost:3001/api/emails/{emailId}/recategorize
```

#### POST `/api/emails/:id/suggest-reply`
Get AI-powered suggested reply (RAG)
```bash
curl -X POST http://localhost:3001/api/emails/{emailId}/suggest-reply
```

## 🎯 Feature Checklist

- ✅ Real-time IMAP sync with IDLE mode (minimum 2 accounts)
- ✅ Fetch last 30 days of emails
- ✅ Persistent IMAP connections (no cron jobs)
- ✅ Elasticsearch integration with Docker
- ✅ Searchable email storage
- ✅ Filter by folder and account
- ✅ AI email categorization (5 categories)
- ✅ Slack notifications for "Interested" emails
- ✅ Webhook triggers for "Interested" emails
- ✅ Frontend UI with Next.js
- ✅ Email display and filtering
- ✅ Search functionality
- ✅ Vector database with PostgreSQL pgvector
- ✅ RAG implementation with OpenAI
- ✅ AI-powered suggested replies

## 🔧 Technology Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- IMAP (with IDLE mode)
- Elasticsearch
- PostgreSQL with pgvector
- OpenAI GPT-4
- Slack Webhook SDK

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios

**Infrastructure:**
- Docker & Docker Compose
- Elasticsearch 8.11
- PostgreSQL with pgvector extension

## 🐛 Troubleshooting

### Backend won't start
- Ensure Docker services are running: `docker ps`
- Check Elasticsearch: `curl http://localhost:9200`
- Check PostgreSQL: `docker logs postgres_vectordb`

### No emails syncing
- Verify IMAP credentials in `backend/.env`
- Check IMAP settings (Gmail requires App Password)
- Look at backend console for connection errors

### Elasticsearch errors
- Restart Elasticsearch: `docker-compose restart elasticsearch`
- Clear and rebuild: `docker-compose down -v && docker-compose up -d`

### AI categorization not working
- Verify OpenAI API key is valid
- Check OpenAI API usage limits

### Frontend shows "Offline"
- Ensure backend is running on port 3001
- Check `.env.local` has correct API URL

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
