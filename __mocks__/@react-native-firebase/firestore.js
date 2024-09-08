// __mocks__/@react-native-firebase/firestore.js

// const firestore = {
//     collection: jest.fn().mockReturnThis(),
//     doc: jest.fn().mockReturnThis(),
//     get: jest.fn().mockResolvedValue({}),
//     set: jest.fn().mockResolvedValue({}),
//     update: jest.fn().mockResolvedValue({}),
//     delete: jest.fn().mockResolvedValue({}),
//   };
  
//   export default firestore;
const firestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: () => ({ /* mock data here */ }), // Return mock data if needed
        })),
        update: jest.fn(() => Promise.resolve()),
      })),
    })),
  };
  
  export default firestore;
  