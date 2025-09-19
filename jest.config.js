module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(webp|svg|png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
