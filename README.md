# WeStudy Backend API

A comprehensive learning platform backend built with NestJS, featuring user authentication, content management, real-time messaging, and search capabilities.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based authentication with Google OAuth integration
- **Content Management**: Posts, lessons, materials, and tags management
- **Real-time Communication**: WebSocket support for live messaging
- **Search Engine**: Typesense integration for fast and accurate search
- **File Upload**: Cloudinary integration for image and file management
- **Favorites System**: Users can favorite posts and materials

### Technical Features
- **Database**: PostgreSQL with TypeORM
- **Search**: Typesense for advanced search capabilities
- **Cloud Storage**: Cloudinary for media management
- **Real-time**: Socket.io for WebSocket connections
- **API Documentation**: Swagger/OpenAPI integration
- **Security**: JWT tokens, bcrypt password hashing, input validation

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Search Engine**: Typesense
- **Authentication**: JWT, Passport.js, Google OAuth
- **File Storage**: Cloudinary
- **Real-time**: Socket.io
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd we-study-back
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy the `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. **Start the databases**
   ```bash
   docker-compose up -d
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# PostgreSQL Configuration
POSTGRES_URL="postgres://postgres:your_password@localhost:5432/we_study"
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="your_secure_password"
POSTGRES_DATABASE="we_study"
POSTGRES_PORT="5432"

# Application Secrets
JWT_SECRET_KEY="your_jwt_secret_key"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Typesense Configuration
TYPESENSE_API_KEY="your_typesense_api_key"
TYPESENSE_HOST="localhost"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Application Environment
NODE_ENV="development"
```

## 🏗️ Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── auth/                      # Authentication module
│   ├── auth.controller.ts     # Auth endpoints
│   ├── auth.service.ts        # Auth business logic
│   ├── strategies/            # Passport strategies
│   ├── guards/                # Auth guards
│   └── dto/                   # Data transfer objects
├── posts/                     # Posts management
├── lessons/                   # Lessons management
├── materials/                 # Materials management
├── tags/                      # Tags management
├── favourites/                # Favorites system
├── messages-ws/               # WebSocket messaging
├── cloudinary/                # File upload service
├── typesense/                 # Search service
└── common/                    # Shared utilities
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/renew-token` - Refresh JWT token
- `GET /api/auth/google` - Google OAuth login
- `PATCH /api/auth/update-user/:id` - Update user profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post by ID
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Lessons
- `GET /api/lessons` - Get all lessons
- `POST /api/lessons` - Create new lesson
- `GET /api/lessons/:id` - Get lesson by ID
- `PATCH /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Materials
- `GET /api/materials` - Get all materials
- `POST /api/materials` - Create new material
- `GET /api/materials/:id` - Get material by ID
- `PATCH /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag
- `GET /api/tags/:term` - Search tags
- `PATCH /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## 🔄 Real-time Features

The application supports real-time messaging through WebSockets:
- Live chat functionality
- Real-time notifications
- Online user presence

## 📚 Database Schema

The application uses PostgreSQL with TypeORM for the following entities:
- **Users**: User accounts and profiles
- **Posts**: Community posts and discussions
- **Lessons**: Educational content
- **Materials**: Learning materials and resources
- **Tags**: Content categorization
- **Favourites**: User favorites system

## 🔍 Search Integration

Typesense is integrated for advanced search capabilities:
- Full-text search across posts, lessons, and materials
- Faceted search and filtering
- Typo tolerance and fuzzy matching
- Fast search performance

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📈 Development

### Available Scripts
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Class-validator for input validation

## 🐳 Docker Support

The project includes Docker configuration for easy deployment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended for production)

## 📝 API Documentation

Once the application is running, you can access the Swagger documentation at:
- Development: `http://localhost:3000/api-docs`

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use environment-specific database connections
3. Configure proper CORS settings
4. Set up SSL certificates
5. Configure rate limiting
6. Set up monitoring and logging

### Environment Setup
1. Configure production database
2. Set up Cloudinary for file storage
3. Configure Google OAuth credentials
4. Set up Typesense instance
5. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using NestJS and TypeScript