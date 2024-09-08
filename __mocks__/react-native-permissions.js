// __mocks__/react-native-permissions.js

// export const check = jest.fn().mockResolvedValue('granted');
// export const request = jest.fn().mockResolvedValue('granted');
// export const PERMISSIONS = {};
// export const RESULTS = {};
// export const openSettings = jest.fn();

export const PERMISSIONS = {
    ANDROID: {
      BLUETOOTH_SCAN: 'mocked.BLUETOOTH_SCAN',
      ACCESS_FINE_LOCATION: 'mocked.ACCESS_FINE_LOCATION',
    },
  };
  
  export const RESULTS = {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  };
  
  export const check = jest.fn(() => Promise.resolve(RESULTS.GRANTED));
  export const request = jest.fn(() => Promise.resolve(RESULTS.GRANTED));
  
