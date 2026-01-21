module.exports = {
  // For GitHub Pages default: https://<user>.github.io/lucky-draw/
  // Override for other deployments (e.g. root domain) via: PUBLIC_PATH=/
  publicPath: process.env.PUBLIC_PATH || (process.env.NODE_ENV === 'production' ? '/lucky-draw' : '/')
};
