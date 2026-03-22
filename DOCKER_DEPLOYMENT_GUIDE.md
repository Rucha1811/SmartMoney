# Docker Deployment Guide for SmartMoney

## What is Docker?
Docker packages your entire application (code + PHP + Apache + all dependencies) into a container that runs identically everywhere - local machine, staging, production.

## Prerequisites
- Docker Desktop installed ([docker.com/products/docker-desktop](https://docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Local Testing with Docker

### 1. Build the Docker Image
```bash
docker build -t smartmoney:latest .
```

### 2. Run with Docker Compose (recommended)
```bash
# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

Your app will be available at `http://localhost:8080`

### 3. Run Individual Container
```bash
docker run -p 8080:80 \
  -e GEMINI_API_KEY="your-api-key" \
  -v $(pwd):/var/www/html \
  smartmoney:latest
```

## Deployment to Railway.app

### Step 1: Connect GitHub
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Authorize and select your SmartMoney repository

### Step 2: Configure as Docker Project
- Railway automatically detects Dockerfile
- It will build the container automatically

### Step 3: Add Environment Variables
In Railway dashboard > Your Project > Settings:
```
GEMINI_API_KEY=your-actual-key
ALPHA_VANTAGE_KEY=your-actual-key
APP_ENV=production
```

### Step 4: Deploy
- Railway automatically deploys when you push to GitHub
- URL provided: `https://your-project.railway.app`

### Step 5: Enable MySQL (Optional)
```bash
# In Railway dashboard:
# 1. Add MySQL service
# 2. Copy connection details
# 3. Add to environment variables as DB_HOST, DB_USER, etc.
```

## Deployment to Render.com

### Step 1: Create Account
Go to [render.com](https://render.com) and sign up

### Step 2: Create New Web Service
- Select "Docker" as the environment
- Connect GitHub repository
- Choose the SmartMoney repo

### Step 3: Configure
- **Plan:** Start with Free tier
- **Region:** Closest to your users
- **Environment Variables:** Add same as Railway

### Step 4: Deploy
- Render builds from Dockerfile
- Auto-deploys on GitHub push

## Docker Command Reference

```bash
# Build image
docker build -t smartmoney:latest .

# List images
docker images

# Run container
docker run -p 8080:80 smartmoney:latest

# Run in background
docker run -d -p 8080:80 smartmoney:latest

# Stop container
docker stop <container-id>

# View running containers
docker ps

# View all containers (running + stopped)
docker ps -a

# View logs
docker logs <container-id>
docker logs -f <container-id>  # Real-time logs

# Remove container
docker rm <container-id>

# Remove image
docker rmi smartmoney:latest

# Docker Compose commands:
docker-compose up        # Start services
docker-compose up -d     # Start in background
docker-compose down      # Stop services
docker-compose logs -f   # Real-time logs
docker-compose ps        # View service status
```

## File Structure Sent to Docker

The `.dockerignore` file excludes these from the Docker image:
- `.git/` - Git history (not needed in production)
- `.venv/` - Local virtualenv (not used)
- `node_modules/` - Not used in PHP app
- `*.md` - Documentation (optional)
- `*.sql` - Database files (handled separately)

## Health Check (Optional)

Add this to `docker-compose.yml` to monitor container health:

```yaml
app:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost/index.html"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Production Best Practices

1. **Never commit .env file** - Railway/Render manage environment variables
2. **Use .env.example** - shows what variables are needed
3. **Keep Dockerfile simple** - complex builds = slower deployments
4. **Use official base images** - php:8.2-apache is maintained by Docker
5. **Cache layers** - Docker caches build steps for faster rebuilds
6. **Pin versions** - Use specific versions, not `latest`

## Troubleshooting

### Container exits immediately
```bash
docker logs <container-id>
# Check for PHP/Apache errors
```

### Port already in use
```bash
# Use different port
docker run -p 9090:80 smartmoney:latest
```

### Can't connect to database
- Check DB_HOST is `db` (not localhost)
- Verify credentials in `.env`
- Ensure db service started: `docker-compose ps`

### API key not working
- Verify variable name matches config file
- Use Railway/Render dashboard to set variables
- Restart deployment after changing variables

## Next Steps

1. ✅ You now have Dockerfile + docker-compose.yml
2. 🔄 Commit to GitHub: `git add Dockerfile docker-compose.yml .env.example .dockerignore`
3. 🚀 Push to GitHub
4. 📦 Deploy to Railway or Render (they'll use the Dockerfile automatically)

## Questions?

- Docker docs: https://docs.docker.com
- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs
