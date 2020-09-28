module.exports = {
  '**/*.js': ['prettier --write', 'eslint --cache --fix'],
  '**/*.{json,md,yml}': ['prettier --write'],
  'package.json': ['prettier --write', 'npm run format:package'],
  '.huskyrc.js': ['prettier --write'],
};
