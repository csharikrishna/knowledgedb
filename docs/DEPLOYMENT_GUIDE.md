# KnowledgeDB Production Deployment Guide

**Last Updated**: 2026-02-28

---

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Start server (development mode with auto-reload)
npm run dev

# Or start with regular Node
npm start

# Server will be available at: http://localhost:5000
```

---

## Production Deployment

### Option 1: Standalone Node Server (Recommended for Small Scale)

#### 1. Environment Setup

Create `.env` file in project root:
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
API_KEY_SALT=$(openssl rand -base64 32)
LOG_LEVEL=info
```

**Security**: Generate strong secrets using OpenSSL or Node's crypto module.

#### 2. Start Server

```bash
node server/server.js
```

**For Better Process Management, Use PM2**:

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server/server.js --name "knowledgedb"

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs knowledgedb

# Restart
pm2 restart knowledgedb

# Stop
pm2 stop knowledgedb
```

---

### Option 2: Docker Deployment (Recommended for Cloud)

#### Create Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server/server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t knowledgedb:latest .

# Run container
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  -e API_KEY_SALT=$(openssl rand -base64 32) \
  -v knowledgedb_data:/app/data \
  --name knowledgedb \
  knowledgedb:latest

# View logs
docker logs -f knowledgedb

# Stop container
docker stop knowledgedb
```

#### Docker Compose (Multiple Services)

```yaml
version: '3.8'

services:
  knowledgedb:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      API_KEY_SALT: ${API_KEY_SALT}
    volumes:
      - knowledgedb_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Add reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - knowledgedb

volumes:
  knowledgedb_data:
```

---

### Option 3: Cloud Platforms

#### AWS EC2
```bash
# 1. Create EC2 instance (t3.small minimum)
# 2. Install Node.js v22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone <your-repo> /home/ec2-user/knowledgedb
cd /home/ec2-user/knowledgedb

# 4. Install PM2
npm install -g pm2

# 5. Start application
pm2 start server/server.js --name "knowledgedb"
pm2 startup
pm2 save
```

#### Heroku
```bash
# Create Procfile
echo "web: node server/server.js" > Procfile

# Deploy
heroku create knowledgedb
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set API_KEY_SALT=$(openssl rand -base64 32)

# View logs
heroku logs --tail
```

#### Railway/Render
- Connect repository to Railway/Render
- Set environment variables in dashboard
- Auto-deploy on git push

---

## HTTPS/TLS Configuration

### Self-Signed Certificates (Development)
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Production Certificates (Let's Encrypt)
```bash
# Using Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### Update app.js for HTTPS
```javascript
const fs = require('fs');
const https = require('https');

const options = {
  key: fs.readFileSync('./certs/private-key.pem'),
  cert: fs.readFileSync('./certs/certificate.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('Server running on https://localhost:443');
});
```

---

## Reverse Proxy Setup (nginx)

### nginx.conf
```nginx
upstream knowledgedb {
  server localhost:5000;
}

server {
  listen 80;
  server_name yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;

  location / {
    proxy_pass http://knowledgedb;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }
}
```

### Enable Configuration
```bash
sudo ln -s /etc/nginx/sites-available/knowledgedb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Database Migration (Optional)

### When to Migrate from File-Based to Database

- Database size > 1 GB
- Concurrent users > 100
- Transactions needed
- Higher reliability required

### PostgreSQL Migration Example

#### 1. Create PostgreSQL Database
```sql
CREATE DATABASE knowledgedb;
CREATE USER knowledgedb WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE knowledgedb TO knowledgedb;

-- Enable vector extension (if using PostgreSQL with pgvector)
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. Update Connection in app.js
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Update your data access layer to use pool.query() instead of file I/O
```

#### 3. Update .env
```bash
DB_USER=knowledgedb
DB_HOST=localhost
DB_PORT=5432
DB_NAME=knowledgedb
DB_PASSWORD=<strong_password>
```

---

## Monitoring & Logging

### Application Logs
```bash
# View server output
tail -f server.log

# Search logs
grep "error" server.log

# Parse Morgan logs
tail -f server.log | grep "POST /db"
```

### System Monitoring

#### CPU, Memory, Disk
```bash
# Overall system
htop

# Node process
ps aux | grep node

# Disk usage
df -h

# Memory usage
free -h
```

#### Using PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Save monitoring data
pm2 start server/server.js --max-memory-restart 500M
```

### Third-Party Monitoring

**New Relic** (APM)
```javascript
// Add at top of server.js
require('newrelic');
```

**Datadog**
```bash
dd-trace@latest installed globally
```

**Sentry** (Error tracking)
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

---

## Backup & Disaster Recovery

### File-Based Backup Strategy

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/knowledgedb"
DB_DIR="/home/knowledgedb/data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/knowledgedb_$TIMESTAMP.tar.gz"

mkdir -p $BACKUP_DIR

# Create tar archive
tar -czf $BACKUP_FILE $DB_DIR

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

#### Cron Schedule (Daily at 2 AM)
```bash
0 2 * * * /path/to/backup.sh
```

#### Upload to Cloud Storage
```bash
# AWS S3
aws s3 cp $BACKUP_FILE s3://my-backups/knowledgedb/

# Google Cloud Storage
gsutil cp $BACKUP_FILE gs://my-backups/knowledgedb/
```

### Restore from Backup
```bash
# Extract backup
tar -xzf knowledgedb_20260228_020000.tar.gz

# Verify
ls -la data/

# Restart server
pm2 restart knowledgedb
```

---

## Security Hardening Checklist

- ✅ Change default JWT_SECRET and API_KEY_SALT
- ✅ Enable HTTPS/TLS
- ✅ Configure firewall (only allow necessary ports)
- ✅ Set up rate limiting (configured in code)
- ✅ Regular security updates (`npm audit`)
- ✅ Database password strength
- ✅ API key rotation policy
- ✅ User access control (JWT scope validation)
- ✅ Input validation (Joi middleware)
- ✅ CORS configuration (limit to known domains)

---

## Performance Tuning

### Node.js Flags
```bash
# Use more memory
node --max-old-space-size=4096 server/server.js

# Enable profiling
node --prof server/server.js

# Multi-core processing
NODE_ENV=production node --enable-source-maps server/server.js
```

### Connection Pool Optimization
```javascript
// In database connection (if using PostgreSQL)
const pool = new Pool({
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy
```javascript
// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getWithCache(key, fn) {
  if (cache.has(key)) {
    const { value, expires } = cache.get(key);
    if (Date.now() < expires) return value;
  }
  
  const value = fn();
  cache.set(key, { value, expires: Date.now() + CACHE_TTL });
  return value;
}
```

---

## Load Testing

### Using Apache Bench
```bash
# 1000 requests, 100 concurrent
ab -n 1000 -c 100 http://localhost:5000/

# POST request with auth
ab -n 1000 -c 100 -H "Authorization: Bearer $TOKEN" \
  -p payload.json \
  http://localhost:5000/db/usr_xxx/testdb/documents/find
```

### Using Artillery
```bash
# Configuration (artillery-config.yml)
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 req/sec

scenarios:
  - name: "Vector Search"
    flow:
      - post:
          url: "/db/usr_xxx/testdb/vector/search"
          headers:
            x-api-key: "kdb_xxx"
          json:
            query: "test query"

# Run test
artillery run artillery-config.yml
```

---

## Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
lsof -i :5000
kill -9 <PID>

# Check Node version
node --version  # Should be v22+

# Check environment variables
echo $NODE_ENV
echo $JWT_SECRET
```

### Out of Memory
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
node server/server.js

# Check memory usage
ps aux | grep node
```

### Slow Performance
```bash
# Enable profiling
node --prof server/server.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt

# Check slow routes
grep "ms - " server.log | sort -t'-' -k3 -rn | head -20
```

### Vector Search Not Working
```bash
# Check index exists
ls -la data/*/*/documents/_vectors/

# Rebuild index
POST /db/{userId}/{dbName}/documents/index/build

# Check stats
GET /db/{userId}/{dbName}/documents/index/stats
```

---

## Maintenance Schedule

### Daily
- ✓ Monitor error logs
- ✓ Check disk space
- ✓ Verify API response times
- ✓ Monitor active connections

### Weekly
- ✓ Review security logs
- ✓ Test backup/restore
- ✓ Update dependencies (`npm update`)
- ✓ Review performance metrics

### Monthly
- ✓ Security audit (`npm audit`)
- ✓ Database optimization
- ✓ Capacity planning
- ✓ Disaster recovery drill

### Quarterly
- ✓ Major version updates
- ✓ Security patching
- ✓ Performance tuning
- ✓ Capacity expansion

---

## Support & Documentation

### Key Resources
- API Documentation: [VECTOR_EMBEDDINGS_DOCS.md](./VECTOR_EMBEDDINGS_DOCS.md)
- Vector Quick Start: [VECTOR_QUICK_START.md](./VECTOR_QUICK_START.md)
- Vector Examples: [VECTOR_EXAMPLES.js](./VECTOR_EXAMPLES.js)
- Production Audit: [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)

### Contact & Issues
```
GitHub: (your repo URL)
Email: (support email)
Slack: (workspace link if available)
```

---

## Final Checklist

Before launching to production:

- [ ] All environment variables configured
- [ ] HTTPS certificates obtained
- [ ] Database backed up
- [ ] Monitoring/logging configured
- [ ] Rate limiting verified
- [ ] Security headers enabled
- [ ] Firewall rules set
- [ ] Load balancer configured (if needed)
- [ ] Team trained on operations
- [ ] Incident response plan ready
- [ ] Rollback procedure documented
- [ ] Support contacts listed

---

## Success Criteria

Your production deployment is successful when:

✅ API responding on target domain
✅ All endpoints return expected responses
✅ Vector search returning ranked results
✅ No errors in logs after 24 hours
✅ Sub-100ms response times for most queries
✅ Backup/restore tested and working
✅ Monitoring alerts configured and firing appropriately
✅ Team comfortable with operational procedures

---

**Deployment completed! Your KnowledgeDB is ready for production.**

