/**
 * PM2 Ecosystem Configuration
 * Production deployment configuration
 */

module.exports = {
  apps: [
    {
      name: 'restaurant-backend',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=2048',
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};

