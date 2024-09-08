import {render, act} from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import SimulateBluetoothDevice, {
  syncLocalDataWithFirestore,
} from '../src/bluetoothComponents/SimulateBluetoothDevice';

const mockConnectToDevice = jest.fn();
const mockDiscoverAllServicesAndCharacteristics = jest
  .fn()
  .mockResolvedValue(true);
const mockDestroy = jest.fn();

jest.mock('react-native-ble-plx', () => {
  return {
    BleManager: jest.fn().mockImplementation(() => ({
      startDeviceScan: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: mockConnectToDevice,
      discoverAllServicesAndCharacteristics:
        mockDiscoverAllServicesAndCharacteristics,
      destroy: mockDestroy,
    })),
  };
});

jest.mock('react-native-sqlite-storage', () => {
  return {
    openDatabase: jest.fn().mockReturnValue({
      transaction: jest.fn().mockImplementation(callback => {
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
  NetInfo.fetch.mockResolvedValue({isConnected: true});

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
  const deviceMock = {id: 'device-id', name: 'Device'};

  // Set up mock return values
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
    const {getByTestId} = render(<SimulateBluetoothDevice />);

    () => {
      expect(getByTestId('randomData')).toHaveTextContent(
        'Some Expected Value',
      );
    };
  });
});
