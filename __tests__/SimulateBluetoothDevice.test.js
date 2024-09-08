
import { render, waitFor, screen, act,fireEvent, } from '@testing-library/react-native';
import { BleManager } from 'react-native-ble-plx';
import SQLite from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import { firestore } from '../firebaseConfig';
import SimulateBluetoothDevice, { syncLocalDataWithFirestore } from '../src/bluetoothComponents/SimulateBluetoothDevice';
import { PERMISSIONS } from '../__mocks__/react-native-permissions';
import { fetchDataFromFirestore } from '../src/bluetoothComponents/SyncLocalDataWithFirestore';
// import { firestore } from '@react-native-firebase/firestore'; // Adjust the import according to your setup
// import { renderHook } from '@testing-library/react-hooks'; // Or any testing utility you are using
import { useState } from 'react';

// Mock state setter functions
const setBatteryPercentage = jest.fn();
const setConnectedDevices = jest.fn();
// Mock BleManager
const mockStartDeviceScan = jest.fn();
const mockStopDeviceScan = jest.fn();
const mockCancelDeviceConnection = jest.fn();


const mockConnectToDevice = jest.fn();
const mockDiscoverAllServicesAndCharacteristics = jest.fn().mockResolvedValue(true);
const mockDestroy = jest.fn();

jest.mock('react-native-ble-plx', () => {
  return {
    BleManager: jest.fn().mockImplementation(() => ({
      startDeviceScan: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: mockConnectToDevice,
      discoverAllServicesAndCharacteristics: mockDiscoverAllServicesAndCharacteristics,
      destroy: mockDestroy,
    })),
  };
});
// jest.mock('react-native-ble-plx', () => {
//   return {
//     BleManager: jest.fn().mockImplementation(() => ({
//       startDeviceScan: jest.fn(),
//       stopDeviceScan: jest.fn(),
//       // connectToDevice: jest.fn(),
//       cancelDeviceConnection: jest.fn(),
//       destroy: jest.fn(),
//     })),
//   };
// });


jest.mock('react-native-sqlite-storage', () => {
  return {
    openDatabase: jest.fn().mockReturnValue({
      transaction: jest.fn().mockImplementation((callback) => {
        callback({
          executeSql: jest.fn(),
        });
      }),
    }),
  };
});

jest.mock('@react-native-community/netinfo', () => {
  return {
    addEventListener: jest.fn().mockReturnValue({
      remove: jest.fn(),
    }),
    fetch: jest.fn().mockResolvedValue({
      isConnected: true,
    }),
  };
});

jest.mock('../firebaseConfig', () => {
  return {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: jest.fn(),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({}),
          }),
        }),
      }),
    }),
  };
});

jest.mock('../src/bluetoothComponents/SimulateBluetoothDevice', () => ({
  __esModule: true,
  syncLocalDataWithFirestore: jest.fn(),
  default: () => <></>, // Mock the default export if needed
}));

it('should call syncLocalDataWithFirestore when connected to the network', async () => {
  // Mock the connectivity state
  NetInfo.fetch.mockResolvedValue({ isConnected: true });

  // Render the component
  render(<SimulateBluetoothDevice />);

  // Call the function directly if needed
  await act(async () => {
    await syncLocalDataWithFirestore();
  });

  // Your assertions
  expect(syncLocalDataWithFirestore).toHaveBeenCalled();
});

it('connects to a Bluetooth device and reads battery level', async () => {
  // Mock data
  const deviceMock = { id: 'device-id', name: 'Device' };

  // Set up mock return values
  // BleManager.prototype.connectToDevice.mockResolvedValue(true);
  // BleManager.prototype.discoverAllServicesAndCharacteristics.mockResolvedValue(true);
  mockConnectToDevice.mockResolvedValue(deviceMock);
  
  // Render the component
  render(<SimulateBluetoothDevice />);
  
  // Trigger the connection (adjust this based on your actual implementation)
  await act(async () => {
    await mockConnectToDevice(deviceMock);
    // await BleManager.prototype.connectToDevice(deviceMock);
  });
  
  // Assertions
  expect(mockConnectToDevice).toHaveBeenCalledWith(deviceMock);
  // Add more assertions as needed
});

describe('Bluetooth Data Test', () => {
  it('reads and displays random data', async () => {
    const { getByTestId } = render(<SimulateBluetoothDevice />);

    (() => {
      expect(getByTestId('randomData')).toHaveTextContent('Some Expected Value');
    });
  });
});



// jest.mock('../src/bluetoothComponents/SimulateBluetoothDevice', () => ({
//   __esModule: true,
//   syncLocalDataWithFirestore: jest.fn(),
//   default: () => <></>, // Mock the default export if needed
// }));

// it('initializes BleManager on mount and destroys it on unmount', () => {
//   const bleManagerMock = {
//     destroy: jest.fn(),
//   };
//   BleManager.mockImplementation(() => bleManagerMock);

//   const { unmount } = render(<SimulateBluetoothDevice />);
  
//   // Ensure BleManager is instantiated
//   expect(BleManager).toHaveBeenCalled();

//   unmount();

//   // Ensure BleManager is destroyed
//   expect(bleManagerMock.destroy).toHaveBeenCalled();
// });




// it('fetches data from Firestore and updates state', async () => {
//   const mockDoc = {
//     exists: true,
//     data: jest.fn().mockReturnValue({
//       batteryPercentage: 50,
//       connectedDevices: JSON.stringify([{ id: '1' }]),
//     }),
//   };

//   firestore().collection().doc().get.mockResolvedValue(mockDoc);

//   render(<YourComponent />);

//   // Wait for state updates and DOM changes
//   await waitFor(() => {
//     // Your component should reflect the state changes
//     expect(screen.getByText('Battery Percentage: 50')).toBeTruthy();
//     expect(screen.getByText('Device ID: 1')).toBeTruthy();
//   });
// });

// it('fetches data from Firestore and updates state', async () => {
//   const mockDoc = {
//     exists: true,
//     data: jest.fn().mockReturnValue({
//       batteryPercentage: 50,
//       connectedDevices: JSON.stringify([{ id: '1' }]),
//     }),
//   };
  
//   firestore().collection().doc().get.mockResolvedValue(mockDoc);

//   // Ensure `fetchDataFromFirestore` uses the mocked setter functions
//   const { result } = renderHook(() => {
//     const [batteryPercentage, setBatteryPercentageState] = useState(null);
//     const [connectedDevices, setConnectedDevicesState] = useState([]);
    
//     // Replace state setters with mocks
//     setBatteryPercentage = setBatteryPercentageState;
//     setConnectedDevices = setConnectedDevicesState;

//     return { batteryPercentage, connectedDevices, fetchDataFromFirestore };
//   });

//   await result.current.fetchDataFromFirestore();
  
//   // Check that state setters were called with the correct values
//   expect(setBatteryPercentage).toHaveBeenCalledWith(50);
//   expect(setConnectedDevices).toHaveBeenCalledWith([{ id: '1' }]);
// });

// it('fetches data from Firestore and updates state', async () => {
//   const mockDoc = {
//     exists: true,
//     data: jest.fn().mockReturnValue({
//       batteryPercentage: 50,
//       connectedDevices: JSON.stringify([{ id: '1' }]),
//     }),
//   };
//   firestore().collection().doc().get.mockResolvedValue(mockDoc);

//   await fetchDataFromFirestore();
//   expect(setBatteryPercentage).toHaveBeenCalledWith(50);
//   expect(setConnectedDevices).toHaveBeenCalledWith([{ id: '1' }]);
// });



// jest.mock('react-native-ble-plx', () => {
//   return {
//     BleManager: jest.fn().mockImplementation(() => ({
//       destroy: jest.fn(),
//     })),
//   };
// });

// jest.mock('../src/bluetoothComponents/SimulateBluetoothDevice', () => ({
//   __esModule: true,
//   syncLocalDataWithFirestore: jest.fn(),
//   default: () => <></>, // Mock the default export if needed
// }));

// describe('SimulateBluetoothDevice', () => {
//   beforeEach(() => {
//     jest.useFakeTimers();
//     jest.resetAllMocks();
//   });

//   afterEach(() => {
//     jest.useRealTimers();
//   });

//   it('initializes BleManager on mount and destroys it on unmount', () => {
//     const bleManagerMock = {
//       destroy: jest.fn(),
//     };
//     BleManager.mockImplementation(() => bleManagerMock);
//     const { unmount } = render(<SimulateBluetoothDevice />);
//     expect(BleManager).toHaveBeenCalled();
//     unmount();
//     expect(bleManagerMock.destroy).toHaveBeenCalled();
//   });
  

  // it('should call syncLocalDataWithFirestore when connected to the network', async () => {
  //   // Mock the connectivity state
  //   NetInfo.fetch.mockResolvedValue({ isConnected: true });

  //   // Render the component
  //   render(<SimulateBluetoothDevice />);

  //   // Call the function directly if needed
  //   await act(async () => {
  //     await syncLocalDataWithFirestore();
  //   });

  //   // Your assertions
  //   expect(syncLocalDataWithFirestore).toHaveBeenCalled();
  // });
// });
  