export default {
  displayName: 'dispatch-panel',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(spec|test).[tj]s?(x)'],
  coverageDirectory: '../../coverage/web/dispatch_panel',
};
