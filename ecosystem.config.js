module.exports = {
  apps: [
    {
      name: "agentsflowai",
      script: "npm",
      args: "start",
      instances: 4, // 4 instances for 4 vCPU cores
      exec_mode: "cluster", // Cluster mode for better performance
      autorestart: true, // Auto-restart on crashes
      watch: false, // Don't watch files in production
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Logging configuration
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Process management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Advanced settings
      node_args: "--max-old-space-size=1024",

      // Restart strategy
      min_uptime: "10s",
      max_restarts: 10,

      // Environment variables
      env_file: ".env.production",
    },
  ],

  // Deploy configuration
  deploy: {
    production: {
      user: "deploy",
      host: ["your-server-ip"],
      ref: "origin/main",
      repo: "git@github.com:codesleeps/agentsflowai-Ver.5.0.0.git",
      path: "/var/www/agentsflowai",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
