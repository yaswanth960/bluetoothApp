// __mocks__/@react-native-community/netinfo.js

const NetInfo = {
    addEventListener: jest.fn(),
    fetch: jest.fn().mockResolvedValue({
      isConnected: true,
    }),
  };
  
  export default NetInfo;
  