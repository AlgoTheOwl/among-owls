module.exports = {
  apps: [
    {
      name: 'AOWL',
      script: 'dist/index.js',
      node_args: '-r dotenv/config',
    },
  ],
}
