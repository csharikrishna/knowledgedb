# Quick Start Guide - KnowledgeDB Web Explorer

## 🚀 Get Started in 2 Minutes

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Backend server running on `http://localhost:5000`
- [ ] Have a user account (or create one in the UI)

### Step 1: Install Dependencies
```bash
cd web-explorer
npm install
```

**Time: ~2 minutes** (depends on internet speed)

### Step 2: Start the Dev Server
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

### Step 3: Login
1. Enter any email and password
2. Click "Sign In" (will create account if needed)
3. You're in! 🎉

## 📋 First Steps

### 1️⃣ Create a Database
- Go to **Dashboard**
- Enter database name (e.g., "my-knowledge")
- Click **Create**

### 2️⃣ Add Documents (via API or Dashboard)
Use the backend API to add documents with entities:
```bash
curl -X POST http://localhost:5000/db/my-knowledge/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Company Overview",
    "content": "Apple is a tech company founded by Steve Jobs in 1976..."
  }'
```

### 3️⃣ Explore Your Knowledge Graph
- Go to **Graph** page
- View the interactive force-directed graph
- Search for entities
- Click nodes to inspect them

### 4️⃣ Search Your Knowledge
- Go to **Search** page
- Try all 3 modes: Keyword, Graph, Hybrid
- Compare relevance scores

### 5️⃣ Store Agent Memories
- Go to **Memory** page
- Store conversations and facts
- Recall memories using keywords
- Perfect for multi-turn conversations

### 6️⃣ Generate LLM Context
- Go to **GraphRAG** page
- Ask any question
- Get LLM-ready context chunks
- Copy and paste into your AI prompts

## 🔧 Configuration

### Change Backend URL
Edit `src/config.js`:
```javascript
const API_CONFIG = {
  API_URL: 'http://your-backend:5000',
  // ...
};
```

Or set environment variable:
```bash
REACT_APP_API_URL=http://your-backend:5000 npm start
```

## 📊 Test with Sample Data

The backend has a seed script. Run it to populate test data:

```bash
cd ../server
node scripts/seed-advanced.js
```

Then refresh the web explorer to see demo data!

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to API" | Verify backend is running: `curl http://localhost:5000/health` |
| "Login keeps failing" | Check browser console (F12) for error messages |
| Graph not rendering | Try refreshing the page, check browser console |
| Search returns no results | Make sure database has documents (run seed script) |
| Memory saving fails | Verify token is valid (try re-logging in) |

## 📚 Next Steps

- Read [README.md](./README.md) for complete documentation
- Check [../../docs/QUICK_START_ADVANCED.md](../../docs/QUICK_START_ADVANCED.md) for API details
- Explore [../../docs/ADVANCED_FEATURES.md](../../docs/ADVANCED_FEATURES.md) for feature depth

## 🎯 Common Tasks

### Reset Session
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### View API Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions to see requests

### Export Search Results
Click the checkbox next to results, then use browser copy-paste.

## 💬 Need Help?

1. Check browser console for error messages (F12)
2. Verify backend console for API errors
3. Review individual page documentation
4. Check the main README for API details

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Creates optimized build in `build/` folder.

### Deploy to Vercel (easiest)
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag 'build' folder to https://app.netlify.com
```

---

**That's it!** You now have a fully functional AI-powered knowledge interface. Happy exploring! 🧠✨
