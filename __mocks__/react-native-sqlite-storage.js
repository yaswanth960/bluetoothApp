// __mocks__/react-native-sqlite-storage.js

const SQLite = {
    openDatabase: jest.fn().mockReturnValue({
      transaction: jest.fn((callback) => {
        callback({
          executeSql: jest.fn((query, params, successCallback, errorCallback) => {
            successCallback && successCallback();
          }),
        });
      }),
    }),
  };
  
  export default SQLite;
  