# Smart Wardrobe 🎽

A comprehensive digital wardrobe management system with AI-powered outfit recommendations, collaboration features, and a beautiful user interface.

## ✨ Features

### 🏠 Core Functionality
- **Digital Wardrobe**: Upload and organize your clothing items with photos
- **Smart Recommendations**: AI-powered outfit suggestions based on weather, occasion, and preferences
- **Outfit Planning**: Plan outfits for the week with a visual calendar
- **Physical Wardrobe View**: Experience your wardrobe like a real closet with different sections

### 👥 Collaboration
- **Friend Styling**: Share your wardrobe with friends and family for styling advice
- **Outfit Suggestions**: Receive and manage outfit suggestions from stylists
- **Collections**: Create shareable collections of specific items
- **Comments & Feedback**: Leave comments on outfit suggestions

### 🎨 User Experience
- **Three View Modes**: Closet, Gallery, and Planner views
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant UI updates when managing items
- **Image Management**: Cloud storage with Supabase integration

### 🔒 Security & Performance
- **JWT Authentication**: Secure user authentication and authorization
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: Graceful error handling with detailed logging
- **Caching**: Intelligent caching for improved performance
- **Monitoring**: Health checks and performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 6.0+
- Supabase account (for image storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-wardrobe.git
cd smart-wardrobe

# Install dependencies
npm run install:all

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Set up database
npm run db:index

# Start development servers
npm run dev
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-wardrobe
JWT_SECRET=your-super-secret-jwt-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=8000
NODE_ENV=development
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

## 📁 Project Structure

```
smart-wardrobe/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── scripts/         # Database scripts
│   └── tests/           # Test files
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── api.js       # API client
│   └── public/          # Static assets
├── docker-compose.yml   # Docker configuration
├── Dockerfile          # Docker image
├── nginx.conf          # Nginx configuration
└── README.md           # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build            # Build both frontend and backend
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend

# Database
npm run db:index         # Create database indexes
npm run db:seed          # Seed with sample data

# Monitoring
npm run logs             # View application logs
npm run health           # Check API health
```

### API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile

#### Clothes Management
- `GET /clothes` - Get user's clothes
- `POST /clothes` - Add new clothing item
- `PUT /clothes/:id` - Update clothing item
- `DELETE /clothes/:id` - Delete clothing item

#### Outfits
- `GET /outfits` - Get user's outfits
- `POST /outfits` - Create new outfit
- `PUT /outfits/:id` - Update outfit
- `DELETE /outfits/:id` - Delete outfit

#### Recommendations
- `GET /recommendations` - Get outfit recommendations
- `POST /recommendations/feedback` - Submit recommendation feedback

#### Collaboration
- `GET /suggestions` - Get outfit suggestions
- `POST /suggestions` - Create outfit suggestion
- `PUT /suggestions/:id/accept` - Accept suggestion
- `PUT /suggestions/:id/reject` - Reject suggestion

#### Collections
- `GET /collections` - Get user's collections
- `POST /collections` - Create collection
- `GET /collections/:id` - Get collection details
- `POST /collections/:id/invite` - Invite to collection

#### Health & Monitoring
- `GET /health` - Health check
- `GET /metrics` - Performance metrics

## 🔧 Configuration

### Database Indexing

The application automatically creates optimized indexes for:
- User authentication and queries
- Clothing item searches and filters
- Outfit recommendations
- Collection management
- Performance optimization

### Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Data validation and sanitization
- **JWT Authentication**: Secure token-based auth
- **File Upload Security**: Secure file handling

### Performance Optimizations

- **Caching**: Intelligent response caching
- **Database Indexing**: Optimized database queries
- **Compression**: Gzip compression
- **CDN Ready**: Static asset optimization
- **Monitoring**: Real-time performance metrics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- api.test.js
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Metrics
```bash
curl http://localhost:8000/metrics
```

### Logs
```bash
# Application logs
npm run logs

# Error logs
npm run logs:error

# Docker logs
docker-compose logs -f api
```

## 🚀 Deployment

### Production Checklist

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

### Cloud Deployment

The application is ready for deployment on:
- **Vercel** (Frontend)
- **Railway/Render/Heroku** (Backend)
- **MongoDB Atlas** (Database)
- **Supabase** (File Storage)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React for the frontend framework
- Node.js and Express for the backend
- MongoDB for data storage
- Supabase for file storage
- Tailwind CSS for styling
- All the open-source libraries that made this possible

## 📞 Support

For support, email support@smartwardrobe.com or create an issue on GitHub.

---

**Smart Wardrobe** - Organize your style, one outfit at a time! ✨
