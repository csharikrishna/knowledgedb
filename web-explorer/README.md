# KnowledgeDB Web Explorer

A modern, interactive React-based web UI for the KnowledgeDB platform, providing complete access to knowledge graphs, hybrid search, AI memory systems, and GraphRAG context generation.

## Features

### 🔐 Authentication
- User login and signup with JWT tokens
- Secure API key management
- Session persistence via localStorage

### 📊 Dashboard
- Database overview and quick stats
- Create new databases
- View graph statistics (entities, relationships, density)
- One-click database selection

### 🕸️ Knowledge Graph Explorer
- Interactive force-directed graph visualization
- Real-time entity search
- Node selection and inspection
- Responsive canvas-based rendering

### 🔍 Hybrid Search
- **Keyword Mode**: Traditional BM25 search
- **Graph Mode**: Entity relationship-based search
- **Hybrid Mode**: Combined keyword + graph scoring
- Detailed relevance scoring breakdown
- Result expansion and inspection

### 🧠 Memory Browser
- Create and manage agent memories
- Session-based memory storage
- Keyword-based memory recall
- Relevance scoring for recalled memories
- Multiple roles: User, Assistant, System

### ⚡ GraphRAG Tester
- Ask natural language questions
- Get LLM-ready context chunks
- View entity connection paths
- See source document references
- Copy context for AI prompts
- Configurable context depth (1-5)

### ⚙️ Admin Panel
- System statistics and overview
- User count tracking
- Database management
- Document count monitoring
- System status indicators

## Installation

### Prerequisites
- Node.js 18+ (tested with v22.22.0)
- Backend server running on `http://localhost:5000`
- npm or yarn package manager

### Steps

1. **Navigate to the web-explorer directory:**
   ```bash
   cd knowledgedb/web-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
web-explorer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── GraphExplorer.jsx
│   │   ├── SearchInterface.jsx
│   │   ├── MemoryBrowser.jsx
│   │   ├── GraphRAGTester.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── Auth.css
│   │   └── Pages.css
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Key Dependencies

- **react**: 18.2.0 - UI framework
- **react-router-dom**: 6.20.0 - Routing
- **axios**: 1.6.0 - HTTP client
- **react-force-graph-2d**: 1.25.0 - Graph visualization
- **lucide-react**: 0.308.0 - Icons
- **recharts**: 2.10.0 - Charts (for future use)
- **zustand**: 4.4.0 - State management (for future use)

## Usage Guide

### Login / Signup
1. Enter email and password
2. Click "Sign In" or toggle to "Sign Up" for new accounts
3. JWT token is automatically stored

### Select a Database
1. Go to Dashboard
2. Click on a database card to select it
3. View quick stats for the selected database

### Explore Knowledge Graph
1. Go to Graph page
2. Search for entities using the search bar
3. Click on nodes to select and inspect them
4. Use Force Graph visualization to understand relationships

### Search Knowledge Base
1. Go to Search page
2. Enter search query
3. Select search mode (Keyword, Graph, or Hybrid)
4. View results with relevance scores
5. Click results to expand and see full content

### Store & Recall Memories
1. Go to Memory page
2. **Store**: Enter content, select role, click Store
3. **Recall**: Search for memories using keywords
4. View relevance scores for recalled memories
5. Delete entire session if needed

### Generate Context with GraphRAG
1. Go to GraphRAG page
2. Ask a natural language question
3. Set context depth (1-5 levels of entity connections)
4. Get LLM-ready context chunks
5. Copy context directly for use in AI prompts
6. View entity connection paths
7. See source documents

### Admin Panel
1. Go to Admin page
2. View system statistics
3. Monitor system health
4. Check API server, storage, and graph engine status

## API Integration

The UI connects to these backend endpoints:

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/signup` - User signup

**Databases**
- `GET /db` - List databases
- `POST /db` - Create database

**Search**
- `POST /db/{dbName}/search` - Perform search

**Graph**
- `GET /db/{dbName}/graph/stats` - Get graph statistics
- `GET /db/{dbName}/graph/search` - Search entities

**Memory**
- `GET /db/{dbName}/memory/{sessionId}` - Get session memories
- `POST /db/{dbName}/memory/{sessionId}` - Store memory
- `POST /db/{dbName}/memory/{sessionId}/recall` - Recall memories
- `DELETE /db/{dbName}/memory/{sessionId}` - Delete session

**GraphRAG**
- `POST /db/{dbName}/ask` - Get context for question

**Admin**
- `GET /admin/stats` - Get system statistics

## Styling

The UI uses CSS variables for theming:

```css
--primary: #3b82f6        /* Blue */
--secondary: #8b5cf6      /* Purple */
--success: #10b981        /* Green */
--danger: #ef4444         /* Red */
--bg-primary: #0f172a     /* Dark blue-black */
--bg-secondary: #1e293b   /* Slate */
--bg-tertiary: #334155    /* Light slate */
```

All colors are defined in `src/App.css` and can be customized there.

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build"]
```

### Environment Variables

Create a `.env` file if needed:
```
REACT_APP_API_URL=http://localhost:5000
```

### Deploy to Vercel/Netlify

1. Build the project: `npm run build`
2. Deploy the `build/` directory to your hosting service
3. Configure environment variables for the backend API URL

## Troubleshooting

### "Cannot GET /" error
- Ensure the React dev server is running
- Try clearing browser cache and restarting

### API connection errors
- Verify backend server is running on port 5000
- Check CORS settings on backend
- Verify JWT token is valid

### Graph visualization not showing
- Check browser console for errors
- Ensure canvas is properly sized (height: 600px)
- Verify ForceGraph2D is installed correctly

### Memory or Search returning no results
- Ensure database has documents
- Check database name spelling
- Verify token is valid and not expired

## Development

### Add a New Page

1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/new" element={<NewPage token={token} dbName={dbName} />} />
   ```
3. Add navigation link in `Navbar.jsx`

### Customize Styles

Edit `src/App.css` and individual component CSS files. All colors use CSS variables.

### Add API Integration

Use the `axios` client:
```javascript
const res = await axios.get('/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Performance Optimization

- Uses React lazy loading for code splitting
- Implements pagination for large result sets
- Memoizes expensive graph calculations
- Local caching of database selections

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile: ✅ Responsive design

## Future Enhancements

- Real-time updates via WebSockets
- Advanced graph filtering
- Custom visualization templates
- Export results to JSON/CSV
- Batch operations for memories
- Graph clustering and community detection
- Custom theming UI
- Dark/light mode toggle

## License

Same as KnowledgeDB main project

## Support

For issues or questions:
1. Check the main KnowledgeDB documentation
2. Review API responses in browser DevTools
3. Check backend server logs
4. Verify database exists and has content
