module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/tests/mocks/AWS.ts'],
};
