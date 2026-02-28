# KnowledgeDB Web Explorer - Installation Guide

## 📦 What's Included

The Web Explorer is a complete React web application that provides a modern interface to the KnowledgeDB backend. It covers all personas:
- 👥 **End Users**: Create and search personal knowledge bases
- 👨‍💼 **Administrators**: Monitor system statistics and health
- 🤖 **Developers**: Test GraphRAG and integrate with AI systems

## 🎯 Quick Installation (< 5 minutes)

### 1. Install Dependencies
```bash
cd knowledgedb/web-explorer
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app opens automatically at `http://localhost:3000`

### 3. Login
Use any email/password to create an account and begin exploring!

---

## 📋 Prerequisites

- **Node.js**: 18.x or higher (tested with v22.22.0)
  - Check: `node --version`
  - Download: https://nodejs.org/

- **Backend Server**: Running on `http://localhost:5000`
  - Start with: `cd server && npm start`
  - Test: `curl http://localhost:5000/health`

- **npm** or **yarn** package manager (comes with Node.js)

---

## 📂 Project Structure After Installation

```
web-explorer/
├── node_modules/                 # Dependencies (created by npm install)
├── public/
│   └── index.html                # HTML entry point
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation component
│   │   └── Navbar.css            # Navigation styles
│   ├── pages/
│   │   ├── Login.jsx             # Authentication page
│   │   ├── Dashboard.jsx         # Home/database selector
│   │   ├── GraphExplorer.jsx     # Graph visualization
│   │   ├── SearchInterface.jsx   # Hybrid search
│   │   ├── MemoryBrowser.jsx     # Agent memory system
│   │   ├── GraphRAGTester.jsx    # LLM context generator
│   │   ├── AdminPanel.jsx        # System admin dashboard
│   │   ├── Auth.css              # Auth page styles
│   │   └── Pages.css             # Page styles
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Global styles
│   ├── config.js                 # Configuration
│   └── index.js                  # React entry point
├── package.json                  # Dependencies list
├── QUICKSTART.md                 # Quick start guide
├── README.md                     # Full documentation
├── FEATURES.md                   # Feature overview
├── INSTALLATION.md               # This file
└── .gitignore                    # Git ignore rules
```

---

## 🚀 Available Scripts

### Development
```bash
npm start
```
- Starts dev server with hot reload
- Opens browser at http://localhost:3000
- Watches for file changes
- Shows compilation errors

### Production Build
```bash
npm run build
```
- Creates optimized production build in `build/` folder
- Minifies code and assets
- Ready for deployment

### Testing
```bash
npm test
```
- Runs Jest test suite
- Watches for changes
- Press `a` to run all tests

### Eject (Advanced)
```bash
npm run eject
```
⚠️ **Warning**: One-way operation! Only use if you need full control.

---

## 🔧 Configuration

### Change Backend URL
**Option 1: Environment Variable**
```bash
REACT_APP_API_URL=http://your-api:5000 npm start
```

**Option 2: Edit config.js**
```javascript
// src/config.js
const API_CONFIG = {
  API_URL: 'http://your-backend-url:5000',
  // ...
};
```

### Customize Colors
Edit `src/App.css`:
```css
:root {
  --primary: #3b82f6;          /* Change button colors */
  --secondary: #8b5cf6;        /* Change secondary colors */
  --bg-primary: #0f172a;       /* Change background */
  /* ... more variables */
}
```

---

## ✅ Verification Steps

After installation, verify everything works:

1. **Check Node.js**
   ```bash
   node --version  # Should show v18+
   npm --version   # Should show 8+
   ```

2. **Install Dependencies**
   ```bash
   cd web-explorer
   npm install     # Should complete without errors
   ```

3. **Start Dev Server**
   ```bash
   npm start       # Should open browser automatically
   ```

4. **Try Login**
   - Any email and password works
   - You should see the Dashboard after login

5. **Test a Feature**
   - Create a database (requires backend records)
   - Or use admin panel to see system stats

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `npm: command not found` | Node.js not installed | Install Node.js 18+ |
| `ERR! code ENOENT` | package.json not found | Navigate to web-explorer directory |
| API connection error | Backend not running | Start server: `cd server && npm start` |
| Port 3000 in use | Another app uses port | `lsof -ti:3000 \| xargs kill -9` or change port in .env |
| Dependencies won't install | Network issue | Try `npm cache clean --force` then `npm install` |
| Blank page after login | Backend CORS issue | Check backend CORS configuration |
| Graph not showing | ForceGraph2D not loaded | Ensure `react-force-graph-2d` is installed |

### Advanced Troubleshooting

**Clear Cache & Reinstall**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**Check Backend Connection**
```bash
# In terminal, test API
curl -X GET http://localhost:5000/health

# Should return 200 OK
```

**View API Requests**
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action
4. Check request/response

---

## 📞 Support Contacts

If you encounter issues:

1. **Check Error Console**: F12 → Console tab
2. **Check Backend Logs**: Terminal where backend server runs
3. **Review Documentation**:
   - [QUICKSTART.md](./QUICKSTART.md) - Quick reference
   - [README.md](./README.md) - Full documentation
   - [FEATURES.md](./FEATURES.md) - Features overview

4. **Common Fixes**:
   - Restart both backend and frontend
   - Clear browser cache and localStorage
   - Check that backend is running and accessible

---

## 🚢 Deployment Guide

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Deploy to Your Server

**Step 1: Build**
```bash
npm run build
```

**Step 2: Install Serve (Optional)**
```bash
npm i -g serve
```

**Step 3: Run**
```bash
serve -s build -p 3000
```

Or use a web server like nginx:
```nginx
server {
  listen 3000;
  location / {
    root /path/to/build;
    try_files $uri /index.html;
  }
}
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]
```

Build and run:
```bash
docker build -t knowledgedb-explorer .
docker run -p 3000:3000 knowledgedb-explorer
```

---

## 📝 Development Tips

### Add a New Backend Integration
1. Create a new API function in a utility
2. Use axios with Bearer token
3. Import and use in your page
4. Handle errors with user feedback

Example:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const myData = await api.get('/db/my-db/endpoint');
```

### Debug Tips
- Use `console.log()` statements
- Use React DevTools extension
- Check Network tab in DevTools
- Look at backend console for API errors
- Test API manually with curl or Postman

### Performance Optimization
- Use React.memo for expensive components
- Implement pagination for large lists
- Use useCallback to prevent unnecessary re-renders
- Load data on demand, not all at once

---

## 🎓 Next Steps

1. **Complete the QUICKSTART**
   - Read [QUICKSTART.md](./QUICKSTART.md)
   - Follow the 5-minute setup

2. **Explore Features**
   - Read [FEATURES.md](./FEATURES.md)
   - Try each page in the app

3. **Integrate with Your Backend**
   - Update API_URL in config.js
   - Test with your data

4. **Customize**
   - Modify colors in App.css
   - Add your logo
   - Adjust layout as needed

5. **Deploy**
   - Follow deployment guide above
   - Share with your team

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Get started in 2 minutes |
| [README.md](./README.md) | Complete reference manual |
| [FEATURES.md](./FEATURES.md) | Feature list and details |
| [../../IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md) | Backend architecture |
| [../../docs/ADVANCED_FEATURES.md](../../docs/ADVANCED_FEATURES.md) | Advanced API features |

---

## 💡 Tips for Success

✅ **Do:**
- Keep backend running while developing frontend
- Use browser DevTools for debugging
- Test all search modes with your data
- Read error messages carefully
- Keep dependencies updated

❌ **Don't:**
- Edit node_modules directly
- Ignore error messages
- Deploy without testing first
- Use old Node.js versions (< 18)
- Store sensitive data in localStorage

---

## 🎯 You're All Set!

You should now be able to:
- ✅ Install the web explorer
- ✅ Start the development server
- ✅ Connect to the backend
- ✅ Use all features
- ✅ Deploy to production
- ✅ Customize to your needs

**Start with QUICKSTART.md for a 5-minute introduction!**

---

**Happy exploring! 🚀**

For questions or issues, check the error console (F12) and refer to the troubleshooting section above.
