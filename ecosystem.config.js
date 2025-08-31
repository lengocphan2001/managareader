module.exports = {
  apps: [
    {
      name: 'truyendex-backend',
      script: './backend/src/server.js',
      cwd: '/var/www/truyendex',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        DATABASE_URL: 'postgresql://truyendex:your_password@localhost:5432/truyendex',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'your_jwt_secret_here',
        TURNSTILE_SECRET_KEY: 'your_turnstile_secret_key',
        TURNSTILE_SITE_KEY: 'your_turnstile_site_key',
        CORS_ORIGIN: 'https://ninetails.site'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'truyendex-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/truyendex',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://ninetails.site/api',
        NEXT_PUBLIC_MANGADEX_API_URL: 'https://api.mangadex.org',
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'your_turnstile_site_key',
        NEXT_PUBLIC_CORS_URL: 'https://ninetails.site',
        NEXT_PUBLIC_CORS_V2_URL: 'https://ninetails.site',
        NEXT_PUBLIC_APP_URL: 'https://ninetails.site',
        NEXT_PUBLIC_BACKEND_URL: 'https://ninetails.site/api',
        NEXT_PUBLIC_APP_IMAGE_URL: 'https://ninetails.site',
        NEXT_PUBLIC_GTM_ID: ''
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_memory_restart: '2G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
