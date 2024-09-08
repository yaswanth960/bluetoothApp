// jest/setup.js

import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            batteryPercentage: 50,
            connectedDevices: JSON.stringify(['Device1', 'Device2']),
            timestamp: new Date().toISOString(),
          }),
        }),
      ),
      update: jest.fn(),
    })),
  })),
}));
