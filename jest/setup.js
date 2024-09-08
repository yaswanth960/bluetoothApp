// jest/setup.js
// import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

// // Mock NetInfo
// jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

// // Add more global mocks here as needed.
// // jest/setup.js
// jest.mock('react-native-sqlite-storage', () => ({
//     openDatabase: jest.fn(() => ({
//       transaction: jest.fn(),
//     })),
//   }));

// jest.setup.js


// jest/setup.js

import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';
import firestore from '@react-native-firebase/firestore';

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

// Mock @react-native-firebase/firestore
jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: true,
        data: () => ({
          batteryPercentage: 50,
          connectedDevices: JSON.stringify(['Device1', 'Device2']),
          timestamp: new Date().toISOString(),
        }),
      })),
      update: jest.fn(),
    })),
  })),
}));

  
  
  
  