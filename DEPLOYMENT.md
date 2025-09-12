# Smart Wardrobe - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 6.0+
- Docker and Docker Compose (optional)
- Supabase account

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-wardrobe.git
cd smart-wardrobe

# Install dependencies
npm run install:all

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env
```

### 2. Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-wardrobe
MONGODB_URI_PROD=mongodb+srv://<username>:<password>@<cluster-host>/<database-name>

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=8000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@smartwardrobe.com

# CORS
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Database Setup

```bash
# Create database indexes
npm run db:index

# Seed with sample data (optional)
npm run db:seed
```

### 4. Build and Start

```bash
# Build the application
npm run build

# Start in production
npm run start:prod
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t smart-wardrobe .

# Run container
docker run -p 8000:8000 --env-file .env smart-wardrobe
```

## ☁️ Cloud Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP addresses
5. Get the connection string
6. Update `MONGODB_URI_PROD` in your `.env`

### Supabase Setup

1. Create a Supabase project
2. Go to Settings > API
3. Copy the URL and service role key
4. Update your `.env` file
5. Set up RLS policies (see `SUPABASE_SETUP.md`)

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Railway/Render/Heroku (Backend)

```bash
# Install CLI for your platform
# Example for Railway:
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## 🔧 Production Configuration

### Nginx Configuration

The included `nginx.conf` provides:
- SSL termination
- Rate limiting
- Gzip compression
- Security headers
- Static file serving

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Monitor logs

### Monitoring

```bash
# Health check
curl http://localhost:8000/health

# View logs
npm run logs

# View error logs
npm run logs:error
```

## 📊 Performance Optimization

### Database Indexes

```bash
# Create optimized indexes
npm run db:index
```

### Caching

- Redis is included in Docker Compose
- Implement Redis caching for frequently accessed data
- Use CDN for static assets

### Load Balancing

- Use multiple API instances behind a load balancer
- Configure sticky sessions if needed
- Monitor resource usage

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI
   - Verify network connectivity
   - Check authentication credentials

2. **Image Upload Issues**
   - Verify Supabase configuration
   - Check RLS policies
   - Verify file size limits

3. **CORS Errors**
   - Update `ALLOWED_ORIGINS` in `.env`
   - Check frontend URL configuration

4. **Rate Limiting**
   - Adjust rate limits in `config/production.js`
   - Check for DDoS attacks

### Logs

```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Docker logs
docker-compose logs -f api
```

## 📈 Scaling

### Horizontal Scaling

1. Deploy multiple API instances
2. Use a load balancer (Nginx, HAProxy)
3. Implement session storage (Redis)
4. Use database read replicas

### Vertical Scaling

1. Increase server resources
2. Optimize database queries
3. Implement caching strategies
4. Use CDN for static assets

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use different secrets for each environment
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Restrict network access
   - Regular backups

3. **API Security**
   - Validate all inputs
   - Implement rate limiting
   - Use HTTPS only
   - Regular security audits

4. **Monitoring**
   - Set up alerts for errors
   - Monitor resource usage
   - Track suspicious activity
   - Regular log analysis

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment configuration
3. Test individual components
4. Check the health endpoint
5. Review this documentation

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and indexed
- [ ] Supabase configured with RLS
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backups scheduled
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Documentation updated
