module.exports = {
  displayName: 'mpesa-service',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
          target: 'ES2021',
          module: 'commonjs',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@cabi/backend/database$': '<rootDir>/../database/src/index.ts',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageDirectory: '../../../coverage/libs/backend/mpesa-service',
};
