import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: __dirname,
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: 'user-portal',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/backend/'],
  coverageDirectory: '../../coverage/web/user_portal',
  // Next.js jest config merges rootDir with these options. We need to make sure 
  // they resolve correctly when run by Nx which passes the workspace root.
};

module.exports = async () => {
  const nextConfig = await createJestConfig(customJestConfig)();
  // We need to override rootDir because next/jest hardcodes it to the project root
  // which breaks the preset path resolution when run by Nx from the workspace root.
  return {
    ...nextConfig,
    rootDir: __dirname,
  };
};
