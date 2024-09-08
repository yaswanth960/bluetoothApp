module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest/setup.js'],
  // setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|react-native-sqlite-storage|react-navigation|@react-native-community|@react-native-firebase|module-to-transform|another-module)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    // '\\.(css|less)$': 'identity-obj-proxy',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/react-native-community/netinfo.js',
    "^react-native-permissions$": "<rootDir>/__mocks__/react-native-permissions.js",
    "^@react-native-firebase/firestore$": "<rootDir>/__mocks__/@react-native-firebase/firestore.js",
    "^react-native-sqlite-storage$": "<rootDir>/__mocks__/react-native-sqlite-storage.js",
    
  },
};
