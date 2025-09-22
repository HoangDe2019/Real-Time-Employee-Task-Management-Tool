#!/bin/bash

# Server Setup Script for IP: 113.173.154.153
# Real-Time Employee Task Management Tool - Backend Deployment

set -e

echo "��� Setting up server 113.173.154.153 for Real-Time Employee Task Management Tool..."

# Update system
echo "��� Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "��� Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "��� Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
echo "��� Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "��� Installing Git..."
sudo apt install -y git

# Create application directory
echo "��� Creating application directory..."
sudo mkdir -p /var/www/rt-employee-task-manager
sudo chown -R $USER:$USER /var/www/rt-employee-task-manager

# Clone the repository
echo "��� Cloning repository..."
cd /var/www/rt-employee-task-manager
git clone https://github.com/hoangde2019/Real-Time-Employee-Task-Management-Tool.git .

# Install server dependencies
echo "��� Installing server dependencies..."
cd server
npm install

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << 'ENVEOF'
# Server Configuration
PORT=4000
NODE_ENV=production

# Firebase Configuration (Update with your Firebase config)
USE_FIREBASE=true
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK
SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
ENVEOF

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'rt-employee-task-manager',
    script: 'src/index.js',
    cwd: '/var/www/rt-employee-task-manager/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/rt-employee-task-manager-error.log',
    out_file: '/var/log/pm2/rt-employee-task-manager-out.log',
    log_file: '/var/log/pm2/rt-employee-task-manager.log'
  }]
};
PM2EOF

# Create Nginx configuration
echo "⚙️ Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/rt-employee-task-manager > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 113.173.154.153;

    # API routes
    location /api/ {
        proxy_pass http://113.173.154.153:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://113.173.154.153:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://lo113.173.154.153calhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Enable the site
echo "��� Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/rt-employee-task-manager /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "��� Testing Nginx configuration..."
sudo nginx -t

# Start and enable services
echo "��� Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Create log directory for PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start the application with PM2
echo "��� Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "��� Saving PM2 configuration..."
pm2 save
pm2 startup

# Open firewall ports
echo "��� Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 4000
sudo ufw --force enable

echo "✅ Server setup completed!"
echo ""
echo "��� Your API server is now running at:"
echo "   http://113.173.154.153:8888"
echo ""
echo "��� Next steps:"
echo "1. Update Firebase configuration in /var/www/rt-employee-task-manager/server/.env"
echo "2. Update email configuration in /var/www/rt-employee-task-manager/server/.env"
echo "3. Test the API: curl http://113.173.154.153:8888/health"
echo "4. Check PM2 status: pm2 status"
echo "5. View logs: pm2 logs rt-employee-task-manager"
echo ""
echo "��� Useful commands:"
echo "   pm2 restart rt-employee-task-manager  # Restart app"
echo "   pm2 stop rt-employee-task-manager     # Stop app"
echo "   pm2 logs rt-employee-task-manager     # View logs"
echo "   sudo systemctl status nginx           # Check Nginx status"
