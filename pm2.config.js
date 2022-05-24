module.exports = {
  apps: [
    {
      name: 'AOWL',
      script: 'dist/src/index.js',
      node_args: '-r dotenv/config',
    },
  ],
}
