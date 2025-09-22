# Real-Time Employee Task Management Tool

A full-stack application with React frontend and Express backend for managing employees and tasks in real-time.

## Features

- **Owner Authentication**: Phone number + 6-digit SMS code verification
- **Employee Management**: CRUD operations for employee records
- **Real-time Chat**: Socket.IO powered messaging system
- **Task Management**: Assign and track employee tasks
- **Firebase Integration**: Scalable database with Firestore
- **Email Notifications**: Automated welcome emails for new employees

## Tech Stack

### Frontend (Client)
- React 18 with JSX
- Vite for build tooling
- Material-UI for components
- Socket.IO client for real-time communication
- Axios for API calls

### Backend (Server)
- Express.js REST API
- Socket.IO for real-time features
- Firebase Firestore database
- Nodemailer for email services
- Repository pattern for data abstraction

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (for production features)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Real-Time-Employee-Task-Management-Tool.git
   cd Real-Time-Employee-Task-Management-Tool
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Configuration**
   
   **Server Environment:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your Firebase and email configuration
   ```
   
   **Client Environment:**
   ```bash
   cd client
   cp .env.example .env
   # Edit .env with your API endpoints
   ```

4. **Run Development Servers**
   ```bash
   # Terminal 1: Start server
   cd server && npm run dev
   
   # Terminal 2: Start client
   cd client && npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## Deployment

### Client Deployment (GitHub Pages)

The client is automatically deployed to GitHub Pages when you push to the `main` or `develop` branch.

**Manual Deployment:**
```bash
cd client
npm run build
# The dist folder will be deployed to GitHub Pages
```

**GitHub Pages Setup:**
1. Go to your repository Settings
2. Navigate to Pages section
3. Select "GitHub Actions" as source
4. The workflow will automatically deploy on push

### Server Deployment

#### Option 1: Railway (Recommended)

1. **Connect Repository**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**
   - Select the `server` folder as root directory
   - Railway will auto-detect Node.js

3. **Set Environment Variables**
   - Go to Variables tab
   - Add all required environment variables:
     ```
     NODE_ENV=production
     FIREBASE_API_KEY=your_key
     FIREBASE_AUTH_DOMAIN=your_domain
     # ... (see .env.example for complete list)
     ```

4. **Deploy**
   - Railway will automatically deploy on every push to main
   - Your app will be available at the provided Railway URL

#### Option 2: Render

1. **Create Web Service**
   - Go to [Render.com](https://render.com)
   - Sign in with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `rt-employee-task-manager-server`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - Go to Environment tab
   - Add all required variables (see .env.example)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your app will be available at the provided Render URL

### Environment Variables

#### Server (.env)
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Firebase Configuration
USE_FIREBASE=true
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK
SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

#### Client (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-server-url.com
VITE_SOCKET_URL=https://your-server-url.com
```

## GitHub Actions

The repository includes automated workflows:

- **Client Deployment**: Automatically builds and deploys to GitHub Pages
- **Server Deployment**: Tests and deploys to Railway/Render (configurable)

### Required Secrets

For server deployment, add these secrets to your GitHub repository:

#### For Railway Deployment
- `RAILWAY_TOKEN`: Your Railway token
- `RAILWAY_SERVICE`: Your Railway service name

#### For Render Deployment
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID

## API Endpoints

### Owner Routes
- `POST /api/owner/CreateNewAccessCode` - Generate SMS access code
- `POST /api/owner/ValidateAccessCode` - Validate access code
- `GET /api/owner/ListEmployees` - List all employees
- `POST /api/owner/CreateEmployee` - Create new employee
- `POST /api/owner/DeleteEmployee` - Delete employee
- `POST /api/owner/UpdateEmployee` - Update employee

### Employee Routes
- `POST /api/employee/LoginEmail` - Employee email login
- `POST /api/employee/ValidateAccessCode` - Validate employee code
- `GET /api/employee/Profile/:id` - Get employee profile
- `PUT /api/employee/Profile/:id` - Update employee profile
- `GET /api/employee/Tasks/:id` - Get employee tasks
- `PUT /api/employee/Task/:id` - Update task status

## Socket.IO Events

- `chat:message` - Send/receive chat messages
- `connect` - Client connection established
- `disconnect` - Client disconnected

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.
