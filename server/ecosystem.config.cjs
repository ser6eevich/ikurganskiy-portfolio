module.exports = {
    apps: [
        {
            name: 'portfolio-server',
            script: 'index.js',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        }
    ]
};
