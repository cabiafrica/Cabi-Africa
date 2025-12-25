import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: 'user-portal',
  preset: '../../../jest.preset.js',
  // transform: {
  //   '^(?!.*\\.[tj]sx?$': '@nx/react/plugins/jest',
  //   '^\\.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  // },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/Cabi Alpha/web/user_portal',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
