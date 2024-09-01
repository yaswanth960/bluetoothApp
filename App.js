// import React from 'react';
// import Coaches from './src/screens/coaches/Coaches';
// import {store} from './src/redux/store';
// import {Provider} from 'react-redux';
// import BluetoothScreen from './src/bluetoothComponents/BluetoothScreen';
// // import BluetoothScreen from './BluetoothScreen';
// const App = () => {
//   return (
//     // <Provider store={store}>
//     //   <Coaches />
//     // </Provider>
//     <BluetoothScreen />

//   );
// };

// export default App;

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, FlatList, Alert } from 'react-native';
// import BleManager from 'react-native-ble-manager';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const App = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     BleManager.start({ showAlert: false });

//     // Cleanup
//     return () => {
//       BleManager.stopScan();
//     };
//   }, []);

//   const startScan = () => {
//     BleManager.scan([], 5, true).then(() => {
//       console.log('Scanning...');
//     });

//     BleManager.on('BleManagerDiscoverPeripheral', (device) => {
//       setDevices((prevDevices) => [...prevDevices, device]);
//     });
//   };

//   const connectToDevice = (device) => {
//     BleManager.connect(device.id)
//       .then(() => {
//         setConnectedDevice(device);
//         simulateDataReading();
//       })
//       .catch((error) => {
//         console.error('Connection Error', error);
//       });
//   };

//   const simulateDataReading = () => {
//     const interval = setInterval(() => {
//       const randomData = Math.floor(Math.random() * 100);
//       setData((prevData) => [...prevData, randomData]);
//       saveDataLocally(randomData);
//     }, 3000);

//     return () => clearInterval(interval);
//   };

//   const saveDataLocally = async (data) => {
//     try {
//       await AsyncStorage.setItem('bluetoothData', JSON.stringify(data));
//     } catch (error) {
//       console.error('Error saving data', error);
//     }
//   };

//   const syncDataToCloud = async () => {
//     try {
//       const localData = await AsyncStorage.getItem('bluetoothData');
//       if (localData) {
//         await axios.post('https://your-cloud-service.com/sync', {
//           data: JSON.parse(localData),
//         });
//         await AsyncStorage.removeItem('bluetoothData');
//         Alert.alert('Data synced successfully');
//       }
//     } catch (error) {
//       console.error('Sync Error', error);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Button title="Scan for Devices" onPress={startScan} />
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Text onPress={() => connectToDevice(item)}>{item.name || 'Unnamed Device'}</Text>
//         )}
//       />
//       {connectedDevice && <Text>Connected to: {connectedDevice.name}</Text>}
//       <Button title="Sync Data" onPress={syncDataToCloud} />
//       <FlatList
//         data={data}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => <Text>Data: {item}</Text>}
//       />
//     </View>
//   );
// };

// export default App;

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, FlatList, Alert, NativeEventEmitter, NativeModules } from 'react-native';
// import BleManager from 'react-native-ble-manager';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const BleManagerModule = NativeModules.BleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// const App = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     BleManager.start({ showAlert: false });

//     const handleDiscoverPeripheral = (device) => {
//       console.log('device',device)
//       setDevices((prevDevices) => [...prevDevices, device]);
//     };

//     bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

//     // Cleanup
//     return () => {
//       bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
//       BleManager.stopScan();
//     };
//   }, []);

//   const startScan = () => {
//     BleManager.scan([], 5, true).then(() => {
//       console.log('Scanning...');
//     });
//   };

//   const connectToDevice = (device) => {
//     BleManager.connect(device.id)
//       .then(() => {
//         setConnectedDevice(device);
//         simulateDataReading();
//       })
//       .catch((error) => {
//         console.error('Connection Error', error);
//       });
//   };

//   const simulateDataReading = () => {
//     const interval = setInterval(() => {
//       const randomData = Math.floor(Math.random() * 100);
//       setData((prevData) => [...prevData, randomData]);
//       saveDataLocally(randomData);
//     }, 3000);

//     return () => clearInterval(interval);
//   };

//   const saveDataLocally = async (data) => {
//     try {
//       await AsyncStorage.setItem('bluetoothData', JSON.stringify(data));
//     } catch (error) {
//       console.error('Error saving data', error);
//     }
//   };

//   const syncDataToCloud = async () => {
//     try {
//       const localData = await AsyncStorage.getItem('bluetoothData');
//       if (localData) {
//         await axios.post('https://your-cloud-service.com/sync', {
//           data: JSON.parse(localData),
//         });
//         await AsyncStorage.removeItem('bluetoothData');
//         Alert.alert('Data synced successfully');
//       }
//     } catch (error) {
//       console.error('Sync Error', error);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Button title="Scan for Devices" onPress={startScan} />
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Text onPress={() => connectToDevice(item)}>{item.name || 'Unnamed Device'}</Text>
//         )}
//       />
//       {connectedDevice && <Text>Connected to: {connectedDevice.name}</Text>}
//       <Button title="Sync Data" onPress={syncDataToCloud} />
//       <FlatList
//         data={data}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => <Text>Data: {item}</Text>}
//       />
//     </View>
//   );
// };

// export default App;

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   FlatList,
//   TouchableOpacity,
//   PermissionsAndroid,
//   Platform,
//   Alert,
//   NativeEventEmitter,
//   NativeModules,
// } from 'react-native';
// import BleManager from 'react-native-ble-manager';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const BleManagerModule = NativeModules.BleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// const App = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     BleManager.start({ showAlert: false });

//     if (Platform.OS === 'android' && Platform.Version >= 23) {
//       PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
//         .then(granted => {
//           if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//             Alert.alert('Permission required', 'Location permission is required to scan for Bluetooth devices');
//           }
//         });
//     }

//     // const handleDiscoverPeripheral = (peripheral) => {
//     //   if (!peripheral.name) {
//     //     peripheral.name = 'NO NAME';
//     //   }
//     //   setDevices((prevDevices) => {
//     //     if (!prevDevices.find(dev => dev.id === peripheral.id)) {
//     //       return [...prevDevices, peripheral];
//     //     }
//     //     return prevDevices;
//     //   });
//     // };

//     const handleDiscoverPeripheral = (peripheral) => {
//       let deviceName = peripheral.name;

//       if (!deviceName && peripheral.advertising) {
//         const { localName } = peripheral.advertising;
//         if (localName) {
//           deviceName = localName;
//         }
//       }

//       if (!deviceName) {
//         deviceName = 'NO NAME';
//       }

//       peripheral.name = deviceName;

//       setDevices((prevDevices) => {
//         if (!prevDevices.find(dev => dev.id === peripheral.id)) {
//           return [...prevDevices, peripheral];
//         }
//         return prevDevices;
//       });
//     };

//     const discoverPeripheralListener = bleManagerEmitter.addListener(
//       'BleManagerDiscoverPeripheral',
//       handleDiscoverPeripheral
//     );

//     return () => {
//       discoverPeripheralListener.remove();
//       BleManager.stopScan();
//     };
//   }, []);

//   const startScan = () => {
//     setDevices([]);
//     const serviceUUIDs = []; // Add specific UUIDs here if known
//     BleManager.scan(serviceUUIDs, 5, true)
//       .then(() => {
//         console.log('Scanning...');
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   };

//   const connectToDevice = (device) => {
//     BleManager.connect(device.id)
//       .then(() => {
//         setConnectedDevice(device);
//         simulateDataReading();
//       })
//       .catch((error) => {
//         console.error('Connection Error', error);
//       });
//   };

//   const simulateDataReading = () => {
//     const interval = setInterval(() => {
//       const randomData = Math.floor(Math.random() * 100);
//       setData((prevData) => [...prevData, randomData]);
//       saveDataLocally(randomData);
//     }, 3000);

//     return () => clearInterval(interval);
//   };

//   const saveDataLocally = async (data) => {
//     try {
//       const existingData = await AsyncStorage.getItem('bluetoothData');
//       const updatedData = existingData ? [...JSON.parse(existingData), data] : [data];
//       await AsyncStorage.setItem('bluetoothData', JSON.stringify(updatedData));
//     } catch (error) {
//       console.error('Error saving data', error);
//     }
//   };

//   const syncDataToCloud = async () => {
//     try {
//       const localData = await AsyncStorage.getItem('bluetoothData');
//       if (localData) {
//         await axios.post('https://your-cloud-service.com/sync', {
//           data: JSON.parse(localData),
//         });
//         await AsyncStorage.removeItem('bluetoothData');
//         Alert.alert('Data synced successfully');
//       }
//     } catch (error) {
//       console.error('Sync Error', error);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Button title="Scan for Devices" onPress={startScan} />
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => connectToDevice(item)}>
//             <Text>{item.name || 'Unnamed Device'}</Text>
//           </TouchableOpacity>
//         )}
//       />
//       {connectedDevice && <Text>Connected to: {connectedDevice.name}</Text>}
//       <Button title="Sync Data" onPress={syncDataToCloud} />
//       <FlatList
//         data={data}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => <Text>Data: {item}</Text>}
//       />
//     </View>
//   );
// };

// export default App;

// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, FlatList, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
// import { BleManager } from 'react-native-ble-plx';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const App = () => {
//   const [manager] = useState(new BleManager());
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     if (Platform.OS === 'android' && Platform.Version >= 23) {
//       PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
//         .then(granted => {
//           if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//             Alert.alert('Permission required', 'Location permission is required to scan for Bluetooth devices');
//           }
//         });
//     }

//     return () => {
//       manager.destroy();
//     };
//   }, [manager]);

//   const startScan = () => {
//     setDevices([]);
//     manager.startDeviceScan(null, null, (error, device) => {
//       if (error) {
//         console.error(error);
//         console.log('1111')
//         return;
//       }

//       console.log('devices',device,'kkkkk',devices,!devices)
//    !devices.find(dev => {
//     console.log('1111222',dev,'jj',device)

//    })
//       if (device && !devices.find(dev => dev.id === device.id)) {
//         console.log('1111222')

//         setDevices(prevDevices => [...prevDevices, device]);
//       }
//     });
//   };

//   const connectToDevice = (device) => {
//     manager.stopDeviceScan();

//     device.connect()
//       .then((connectedDevice) => {
//         setConnectedDevice(connectedDevice);
//         simulateDataReading();
//       })
//       .catch((error) => {
//         console.error('Connection Error', error);
//       });
//   };

//   const simulateDataReading = () => {
//     const interval = setInterval(() => {
//       const randomData = Math.floor(Math.random() * 100);
//       setData(prevData => [...prevData, randomData]);
//       saveDataLocally(randomData);
//     }, 3000);

//     return () => clearInterval(interval);
//   };

//   const saveDataLocally = async (data) => {
//     try {
//       const existingData = await AsyncStorage.getItem('bluetoothData');
//       const updatedData = existingData ? [...JSON.parse(existingData), data] : [data];
//       await AsyncStorage.setItem('bluetoothData', JSON.stringify(updatedData));
//     } catch (error) {
//       console.error('Error saving data', error);
//     }
//   };

//   const syncDataToCloud = async () => {
//     try {
//       const localData = await AsyncStorage.getItem('bluetoothData');
//       if (localData) {
//         // Example: Sync to your cloud service
//         await AsyncStorage.removeItem('bluetoothData');
//         Alert.alert('Data synced successfully');
//       }
//     } catch (error) {
//       console.error('Sync Error', error);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Button title="Scan for Devices" onPress={startScan} />
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => connectToDevice(item)}>
//             <Text>{item.name || 'Unnamed Device'}</Text>
//           </TouchableOpacity>
//         )}
//       />
//       {connectedDevice && <Text>Connected to: {connectedDevice.name}</Text>}
//       <Button title="Sync Data" onPress={syncDataToCloud} />
//       <FlatList
//         data={data}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => <Text>Data: {item}</Text>}
//       />
//     </View>
//   );
// };

// export default App;

// import React, {useState, useEffect} from 'react';
// import {
//   Text,
//   Alert,
//   View,
//   FlatList,
//   Platform,
//   StatusBar,
//   SafeAreaView,
//   NativeModules,
//   useColorScheme,
//   TouchableOpacity,
//   NativeEventEmitter,
//   PermissionsAndroid,
// } from 'react-native';
// import BleManager from 'react-native-ble-manager';
// import {Colors} from 'react-native/Libraries/NewAppScreen';
// // import {DeviceList} from './src/DeviceList';
// // import {styles} from './src/styles/styles';
// import { DeviceList } from './src/bluettoth/DeviceList';
// import { styles } from './src/styles/styles';

// const BleManagerModule = NativeModules.BleManager;
// const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// const App = () => {
//   const peripherals = new Map();
//   const [isScanning, setIsScanning] = useState(false);
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [discoveredDevices, setDiscoveredDevices] = useState([]);
//   const handleGetConnectedDevices = () => {
//     BleManager.getBondedPeripherals([]).then(results => {
//       for (let i = 0; i < results.length; i++) {
//         let peripheral = results[i];
//         peripheral.connected = true;
//         peripherals.set(peripheral.id, peripheral);
//         setConnectedDevices(Array.from(peripherals.values()));
//       }
//     });
//   };
//   useEffect(() => {
//     BleManager.enableBluetooth().then(() => {
//       console.log('Bluetooth is turned on!');
//     });
//     BleManager.start({showAlert: false}).then(() => {
//       console.log('BleManager initialized');
//       handleGetConnectedDevices();
//       BleManager.getDiscoveredPeripherals
//     });
//     let stopDiscoverListener = BleManagerEmitter.addListener(
//       'BleManagerDiscoverPeripheral',
//       peripheral => {
//         peripherals.set(peripheral.id, peripheral);
//         setDiscoveredDevices(Array.from(peripherals.values()));
//       },
//     );
//     let stopConnectListener = BleManagerEmitter.addListener(
//       'BleManagerConnectPeripheral',
//       peripheral => {
//         console.log('BleManagerConnectPeripheral:', peripheral);
//       },
//     );
//     // let stopScanListener = BleManagerEmitter.addListener(
//     //   'BleManagerStopScan',
//     //   () => {
//     //     setIsScanning(false);
//     //     console.log('scan stopped');
//     //   },
//     // );
//     let stopScanListener = BleManagerEmitter.addListener(
//       'BleManagerStopScan',
//       () => {
//         setIsScanning(false);
//         console.log('scan stopped');
//         // Fetch discovered peripherals after scan stops
//         BleManager.getDiscoveredPeripherals([]).then(peripheralsArray => {
//           if (peripheralsArray.length === 0) {
//             console.log('No peripherals discovered');
//           } else {
//             console.log('Discovered peripherals:', peripheralsArray);
//             setDiscoveredDevices(peripheralsArray);
//           }
//         }).catch(error => {
//           console.error('Failed to get discovered peripherals:', error);
//         });
//       },
//     );
//     if (Platform.OS === 'android' && Platform.Version >= 23) {
//       PermissionsAndroid.check(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//       ).then(result => {
//         if (result) {
//           console.log('Permission is OK');
//         } else {
//           PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           ).then(result => {
//             if (result) {
//               console.log('User accepted');
//             } else {
//               console.log('User refused');
//             }
//           });
//         }
//       });
//     }
//     return () => {
//       stopDiscoverListener.remove();
//       stopConnectListener.remove();
//       stopScanListener.remove();
//     };
//   }, []);
//   const startScan = () => {
//     if (!isScanning) {
//       BleManager.scan([], 55, true)
//         .then(() => {
//           console.log('Scanning...');
//           setIsScanning(true);
//         })
//         .catch(error => {
//           console.error(error);
//         });
//     }
//   };
//   // pair with device first before connecting to it
//   const connectToPeripheral = peripheral => {
//     BleManager.createBond(peripheral.id)
//       .then(() => {
//         peripheral.connected = true;
//         peripherals.set(peripheral.id, peripheral);
//         setConnectedDevices(Array.from(peripherals.values()));
//         setDiscoveredDevices(Array.from(peripherals.values()));
//         console.log('BLE device paired successfully');
//       })
//       .catch(() => {
//         console.log('failed to bond');
//       });
//   };
//   // disconnect from device
//   const disconnectFromPeripheral = peripheral => {
//     BleManager.removeBond(peripheral.id)
//       .then(() => {
//         peripheral.connected = false;
//         peripherals.set(peripheral.id, peripheral);
//         setConnectedDevices(Array.from(peripherals.values()));
//         setDiscoveredDevices(Array.from(peripherals.values()));
//         Alert.alert(`Disconnected from ${peripheral.name}`);
//       })
//       .catch(() => {
//         console.log('fail to remove the bond');
//       });
//   };
//   const isDarkMode = useColorScheme() === 'dark';
//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };
//   // render list of bluetooth devices
//   return (
//     <SafeAreaView style={[backgroundStyle, styles.container]}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <View style={{pdadingHorizontal: 20}}>
//         <Text
//           style={[
//             styles.title,
//             {color: isDarkMode ? Colors.white : Colors.black},
//           ]}>
//           React Native BLE Manager Tutorial
//         </Text>
//         <TouchableOpacity
//           activeOpacity={0.5}
//           style={styles.scanButton}
//           onPress={startScan}>
//           <Text style={styles.scanButtonText}>
//             {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
//           </Text>
//         </TouchableOpacity>
//         <Text
//           style={[
//             styles.subtitle,
//             {color: isDarkMode ? Colors.white : Colors.black},
//           ]}>
//           Discovered Devices:
//         </Text>
//         {discoveredDevices.length > 0 ? (
//           <FlatList
//             data={discoveredDevices}
//             renderItem={({item}) => (
//               <DeviceList
//                 peripheral={item}
//                 connect={connectToPeripheral}
//                 disconnect={disconnectFromPeripheral}
//               />
//             )}
//             keyExtractor={item => item.id}
//           />
//         ) : (
//           <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
//         )}
//         <Text
//           style={[
//             styles.subtitle,
//             {color: isDarkMode ? Colors.white : Colors.black},
//           ]}>
//           Connected Devices:
//         </Text>
//         {connectedDevices.length > 0 ? (
//           <FlatList
//             data={connectedDevices}
//             renderItem={({item}) => (
//               <DeviceList
//                 peripheral={item}
//                 connect={connectToPeripheral}
//                 disconnect={disconnectFromPeripheral}
//               />
//             )}
//             keyExtractor={item => item.id}
//           />
//         ) : (
//           <Text style={styles.noDevicesText}>No connected devices</Text>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };
// export default App;

// good above

// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
// import BluetoothSerial from 'react-native-bluetooth-classic';

// const App = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);

//   useEffect(() => {
//     // Check if Bluetooth is enabled
//     BluetoothSerial.isBluetoothEnabled()
//       .then((enabled) => {
//         if (!enabled) {
//           BluetoothSerial.requestEnable()
//             .then(() => console.log('Bluetooth Enabled'))
//             .catch((err) => console.error('Error enabling Bluetooth', err));
//         }
//       })
//       .catch((err) => console.error('Error checking Bluetooth', err));
//   }, []);

//   const discoverDevices = async () => {
//     try {
//       const unpairedDevices = await BluetoothSerial.listUnpaired();
//       setDevices(unpairedDevices);
//     } catch (error) {
//       console.error('Error discovering devices', error);
//     }
//   };

//   const connectToDevice = async (device) => {
//     try {
//       await BluetoothSerial.connect(device.id);
//       setConnectedDevice(device);
//       console.log('Connected to', device.name);
//     } catch (error) {
//       console.error('Error connecting to device', error);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Discover Devices" onPress={discoverDevices} />

//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => connectToDevice(item)}>
//             <Text>{item.name}</Text>
//             <Text>{item.id}</Text>
//           </TouchableOpacity>
//         )}
//       />

//       {connectedDevice && (
//         <Text>Connected to: {connectedDevice.name}</Text>
//       )}
//     </View>
//   );
// };

// export default App;
// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
// import BleManager from 'react-native-ble-manager';
// import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';

// const BleManagerModule = NativeModules.BleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// const App = () => {
//   const [devices, setDevices] = useState([]);

//   useEffect(() => {
//     BleManager.start({ showAlert: false });

//     // Request permissions on Android
//     if (Platform.OS === 'android' && Platform.Version >= 23) {
//       PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//         PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//       ]).then((result) => {
//         if (
//           result['android.permission.ACCESS_FINE_LOCATION'] !== 'granted' ||
//           result['android.permission.BLUETOOTH_SCAN'] !== 'granted' ||
//           result['android.permission.BLUETOOTH_CONNECT'] !== 'granted'
//         ) {
//           console.log('Bluetooth or location permissions are denied');
//         }
//       });
//     }

//     const handleDiscoverPeripheral = (peripheral) => {
//       console.log('Discovered peripheral', peripheral);
//       setDevices((prevDevices) => [...prevDevices, peripheral]);
//     };

//     bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

//     return () => {
//       bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
//     };
//   }, []);

//   const startScan = () => {
//     BleManager.scan([], 5, true).then(() => {
//       console.log('Scanning started');
//     }).catch((err) => {
//       console.error('Error starting scan', err);
//     });
//   };

//   const connectToDevice = async (device) => {
//     try {
//       await BleManager.connect(device.id);
//       console.log('Connected to', device.name);
//     } catch (error) {
//       console.error('Error connecting to device', error);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Discover Devices" onPress={startScan} />
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => connectToDevice(item)}>
//             <Text>{item.name || 'Unnamed Device'}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// };

// export default App;

// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity } from 'react-native';
// import { BleManager } from 'react-native-ble-plx';

// const BluetoothScanner = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const manager = new BleManager();

//   useEffect(() => {

//     if (!manager) {
//       manager = new BleManager();
//     }
//     const subscription = manager.onStateChange((state) => {
//       if (state === 'PoweredOn') {
//         scanForDevices();
//         subscription.remove();
//       }
//     }, true);

//     return () => manager.destroy();
//   }, [manager]);

//   const scanForDevices = () => {
//     manager.startDeviceScan(null, null, (error, device) => {
//       if (error) {
//         console.error(error);
//         return;
//       }

//       manager.stopDeviceScan();

//       setDevices((prevDevices) => {
//         if (!prevDevices.some((d) => d.id === device.id)) {
//           return [...prevDevices, device];
//         }
//         return prevDevices;
//       });
//     });

//     setTimeout(() => manager.stopDeviceScan(), 10000);
//   };

//   // const connectToDevice = async (device) => {
//   //   try {
//   //     const connectedDevice = await manager.connectToDevice(device.id);
//   //     setConnectedDevice(connectedDevice);
//   //     console.log('Connected to', connectedDevice.name);
//   //     await connectedDevice.discoverAllServicesAndCharacteristics();
//   //     readDataFromDevice(connectedDevice); // Optional: Automatically read data after connection
//   //   } catch (error) {
//   //     console.error('Connection failed', error);
//   //   }
//   // };

//   const connectToDevice = async (device) => {
//     try {
//       // Check if BleManager is not destroyed
//       if (!manager) {
//         console.error('BleManager is destroyed or not available.');
//         return;
//       }
//       console.log('1111',device.id)

//       const connectedDevice = await manager.connectToDevice(device.id);
//       console.log('Connected to', connectedDevice.name);

//       setConnectedDevice(connectedDevice);

//       // Discover services and characteristics
//       await connectedDevice.discoverAllServicesAndCharacteristics();

//       // Optionally, read data
//       readDataFromDevice(connectedDevice);
//     } catch (error) {
//       console.error('Connection failed', error);
//     }
//   };

//   const readDataFromDevice = async (device) => {
//     try {
//       const services = await device.services();
//       const characteristics = await services[0].characteristics();
//       const characteristic = characteristics[0];
//       const data = await characteristic.read();
//       console.log('Data:', data.value);
//     } catch (error) {
//       console.error('Read failed', error);
//     }
//   };

//   return (
//     <View>
//       <Text>Bluetooth Devices:</Text>
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => connectToDevice(item)}>
//             <Text>{item.name || 'Unnamed Device'}</Text>
//           </TouchableOpacity>
//         )}
//       />
//       {connectedDevice && (
//         <Text>Connected to: {connectedDevice.name}</Text>
//       )}
//     </View>
//   );
// };

// export default BluetoothScanner;

// working above getting near by devices

// import React, {useEffect, useState} from 'react';
// import {View, Text, FlatList, TouchableOpacity} from 'react-native';
// import {BleManager} from 'react-native-ble-plx';
// import {Buffer} from 'buffer';

// const BluetoothScanner = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const [manager, setManager] = useState(null);
//   const [batteryPercentage, setBatteryPercentage] = useState(null);

//   useEffect(() => {
//     const bleManager = new BleManager();
//     setManager(bleManager);

//     const subscription = bleManager.onStateChange(state => {
//       if (state === 'PoweredOn') {
//         scanForDevices(bleManager);
//         subscription.remove();
//       }
//     }, true);

//     return () => {
//       bleManager.destroy();
//       setManager(null);
//     };
//   }, []);

//   const scanForDevices = bleManager => {
//     bleManager.startDeviceScan(null, null, (error, device) => {
//       if (error) {
//         console.error(error);
//         return;
//       }

//       // Stop scanning and attempt to connect as soon as a device is found
//       bleManager.stopDeviceScan();

//       // Add the device to the list if it's not already present
//       setDevices(prevDevices => {
//         if (!prevDevices.some(d => d.id === device.id)) {
//           return [...prevDevices, device];
//         }
//         return prevDevices;
//       });

//       // Automatically connect to the first discovered device
//       // connectToDevice(bleManager, device);
//     });

//     // Optional: Stop scanning after a set period (e.g., 10 seconds)
//     setTimeout(() => bleManager.stopDeviceScan(), 10000);
//   };

//   const connectToDevice = async (bleManager, device) => {
//     try {
//       // Ensure BleManager is available
//       if (!bleManager) {
//         console.error('BleManager is destroyed or not available.');
//         return;
//       }

//       // Connect to the device
//       const connectedDevice = await bleManager.connectToDevice(device.id);
//       setConnectedDevice(connectedDevice);
//       console.log('Connected to', connectedDevice.name);

//       // Discover services and characteristics
//       await connectedDevice.discoverAllServicesAndCharacteristics();

//       // Optionally, read data from the device
//       readBatteryLevel(connectedDevice);
//     } catch (error) {
//       console.error('Connection failed', error);
//     }
//   };

//   const readBatteryLevel = async device => {
//     // Assuming 'device' is your connected Bluetooth device
//     const services = await device.services();

//     // Loop through all services
//     for (const service of services) {
//       console.log(`Service UUID: ${service.uuid}`);

//       // Get characteristics for this service
//       const characteristics = await service.characteristics();

//       for (const characteristic of characteristics) {
//         console.log(`Characteristic UUID: ${characteristic.uuid}`);

//         // Here you can add conditions based on your requirements
//         if (
//           service.uuid.includes('180f') &&
//           characteristic.uuid.includes('2a19')
//         ) {
//           // This is an example condition for a battery service and battery level characteristic
//           console.log('Battery service and characteristic found');

//           // Perform read or write operations here
//           // const batteryLevel = await characteristic.read();
//           const data = await characteristic.read();

//           // Decode the Base64 value to get the battery percentage
//           const decodedValue = Buffer.from(data.value, 'base64');
//           const batteryPercentage = decodedValue[0]; // Battery percentage is usually in the first byte
//           setBatteryPercentage(batteryPercentage);
//           console.log('Battery Level:11', batteryPercentage, '%');
//           // console.log(`Battery Level: ${batteryLevel}`,batteryLevel);
//         }

//         // You can also handle other services/characteristics here
//         // Example:
//         // if (service.uuid.includes('XXXX') && characteristic.uuid.includes('YYYY')) {
//         //   // Perform some other operation
//         // }
//       }
//     }
//   };

//   return (
//     <View>
//       <Text>Bluetooth Devices:</Text>
//       <FlatList
//         data={devices}
//         keyExtractor={item => item.id}
//         renderItem={({item}) => (
//           <TouchableOpacity onPress={() => connectToDevice(manager, item)}>
//             <Text>{item.name || 'Unnamed Device'}</Text>
//           </TouchableOpacity>
//         )}
//       />
//       {batteryPercentage !== null && (
//         <Text>Battery Level: {batteryPercentage} %</Text>
//       )}
//     </View>
//   );
// };

// export default BluetoothScanner;

// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   useColorScheme,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import {BleManager} from 'react-native-ble-plx';
// import {Buffer} from 'buffer';
// import {request, PERMISSIONS, check, RESULTS} from 'react-native-permissions';
// import {openSettings} from 'react-native-permissions';
// import {styles} from './src/styles/styles';
// import {Colors} from 'react-native/Libraries/NewAppScreen';
// import firestore from '@react-native-firebase/firestore';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import NetInfo from '@react-native-community/netinfo';

// const BluetoothScanner = () => {
//   const [devices, setDevices] = useState([]);
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [manager, setManager] = useState(null);
//   const [batteryPercentage, setBatteryPercentage] = useState(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [connectingToDevice, setConnectingToDevice] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const bleManager = new BleManager();
//     setManager(bleManager);
//     return () => {
//       bleManager.destroy();
//       setManager(null);
//     };
//   }, []);

//   useEffect(() => {
//     // Check network connectivity and sync local storage with Firestore if online
//     const unsubscribe = NetInfo.addEventListener(state => {
//       console.log('state.isConnected', state.isConnected);
//       if (state.isConnected) {
//         syncLocalDataWithFirestore();
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     // Fetch data from Firestore or local storage based on network availability
//     const fetchData = async () => {
//       const state = await NetInfo.fetch();
//       if (state.isConnected) {
//         console.log('111');
//         fetchDataFromFirestore();
//       } else {
//         console.log('12222');
//         fetchDataFromLocalStorage();
//       }
//     };
//     fetchData();
//   }, []);

//   const checkPermissions = async () => {
//     const bluetoothStatus = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
//     const locationStatus = await check(
//       PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//     );

//     if (bluetoothStatus === RESULTS.DENIED) {
//       await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
//     }

//     if (locationStatus === RESULTS.DENIED) {
//       await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
//     }

//     if (
//       bluetoothStatus === RESULTS.BLOCKED ||
//       locationStatus === RESULTS.BLOCKED
//     ) {
//       Alert.alert(
//         'Permissions Required',
//         'Bluetooth and Location permissions are required to scan for devices. Please enable them in the app settings.',
//         [{text: 'Open Settings', onPress: openSettings}],
//       );
//     }
//   };

//   const scanForDevices = async () => {
//     await checkPermissions();
//     setIsScanning(true);

//     manager.startDeviceScan(null, null, (error, device) => {
//       if (error) {
//         console.error(error);
//         return;
//       }

//       if (device) {
//         setDevices(prevDevices => {
//           if (!prevDevices.some(d => d.id === device.id)) {
//             return [...prevDevices, device];
//           }
//           return prevDevices;
//         });
//       }
//     });

//     setTimeout(() => {
//       manager.stopDeviceScan();
//       setIsScanning(false);
//     }, 10000);
//   };

//   const connectToDevice = async device => {
//     try {
//       if (!manager) {
//         console.error('BleManager is not available.');
//         return;
//       }
//       setConnectingToDevice(true);
//       const connectedDevice = await manager.connectToDevice(device.id);
//       await connectedDevice.discoverAllServicesAndCharacteristics();
//       const connectedDevices = [...connectedDevices, connectedDevice];

//       // setConnectedDevices(connectedDevices);
//       setDevices(prevDevices => prevDevices.filter(d => d.id !== device.id));
//       // setConnectingToDevice(false);

//       readBatteryLevel(connectedDevice, connectedDevices);
//     } catch (error) {
//       setConnectingToDevice(false);
//       console.error('Connection failed', error);
//     }
//   };

//   const disconnectFromDevice = async (device) => {
//     try {
//       if (!manager) {
//         console.error('BleManager is not available.');
//         return;
//       }

//       const isDeviceConnected = connectedDevices.some(d => d.id === device.id);

//       if (!isDeviceConnected) {
//         console.warn(`Device ${device.id} is not connected.`);
//         return;
//       }

//       await manager.cancelDeviceConnection(device.id);
//       setConnectingToDevice(true);

//       setConnectedDevices(prevConnected =>
//         prevConnected.filter(d => d.id !== device.id),
//       );
//       setDevices(prevDevices => [...prevDevices, device]);
//       setConnectingToDevice(false);
//     } catch (error) {
//       setConnectingToDevice(false);
//       console.error('Disconnection failed', error);
//     }
//   };

//   const readBatteryLevel = async (device, connectedDevices) => {
//     const services = await device.services();

//     for (const service of services) {
//       const characteristics = await service.characteristics();
//       for (const characteristic of characteristics) {
//         if (
//           service.uuid.includes('180f') &&
//           characteristic.uuid.includes('2a19')
//         ) {
//           const data = await characteristic.read();
//           const decodedValue = Buffer.from(data.value, 'base64');
//           const batteryPercentage = decodedValue[0];
//           // setBatteryPercentage(batteryPercentage);
//           console.log('Battery Level:', batteryPercentage, '%');

//           // Save battery percentage locally and attempt to sync with Firestore
//           await saveBatteryPercentage(batteryPercentage, connectedDevices);
//         }
//       }
//     }
//   };

//   const saveBatteryPercentage = async (batteryPercentage, connectedDevices) => {
//     try {
//       const state = await NetInfo.fetch();
//       const deviceData = {
//         batteryPercentage: batteryPercentage,
//         connectedDevices: connectedDevices.filter(
//           device => device && device.id,
//         ), // Ensure no null values
//       };

//       if (state.isConnected) {
//         // Sync with Firestore if online
//         await firestore()
//           .collection('BatteryData')
//           .add({
//             ...deviceData,
//             timestamp: firestore.FieldValue.serverTimestamp(),
//           });
//         console.log(
//           'Battery percentage synced with Firestore:',
//           batteryPercentage,
//         );
//       } else {
//         // Save locally if offline
//         const jsonData = JSON.stringify(deviceData);
//         await EncryptedStorage.setItem('deviceData', jsonData);
//         console.log('Device data saved to EncryptedStorage:', jsonData);
//       }

//       // Update local state
//       setConnectedDevices(connectedDevices);
//       setBatteryPercentage(batteryPercentage);
//       setConnectingToDevice(false);
//     } catch (error) {
//       setConnectingToDevice(false);
//       console.error('Failed to save battery percentage:', error);
//     }
//   };

//   const syncLocalDataWithFirestore = async () => {
//     try {
//       const jsonData = await EncryptedStorage.getItem('deviceData');
//       if (jsonData) {
//         const deviceData = JSON.parse(jsonData);

//         // Add to Firestore
//         await firestore()
//           .collection('BatteryData')
//           .add({
//             ...deviceData,
//             timestamp: firestore.FieldValue.serverTimestamp(),
//           });
//         console.log('Local data synced with Firestore:', deviceData);

//         // Clear local storage after successful sync
//         // await EncryptedStorage.removeItem('deviceData');
//       }
//     } catch (error) {
//       console.error('Failed to sync local data with Firestore:', error);
//     }
//   };

//   const fetchDataFromFirestore = async () => {
//     try {
//       const snapshot = await firestore()
//         .collection('BatteryData')
//         .orderBy('timestamp', 'desc')
//         .limit(1)
//         .get();

//       if (!snapshot.empty) {
//         const data = snapshot.docs[0].data();
//         console.log('Fetched data from Firestore:', data);

//         setBatteryPercentage(data.batteryPercentage);
//         setConnectedDevices(data.connectedDevices);
//       }
//     } catch (error) {
//       console.error('Failed to fetch data from Firestore:', error);
//     }
//   };

//   const fetchDataFromLocalStorage = async () => {
//     try {
//       // Retrieve the JSON string from EncryptedStorage
//       const jsonData = await EncryptedStorage.getItem('deviceData');

//       if (jsonData) {
//         // Parse the JSON string back into an object
//         const data = JSON.parse(jsonData);
//         console.log('Device data fetched from EncryptedStorage:', data);

//         // Now you can use the data as needed
//         const batteryPercentage = data.batteryPercentage;
//         const connectedDevices = data.connectedDevices;

//         // For example, set these values back into state
//         setBatteryPercentage(batteryPercentage);
//         setConnectedDevices(connectedDevices);
//       } else {
//         console.log('No device data found in EncryptedStorage.');
//       }
//     } catch (error) {
//       console.error('Failed to fetch device data:', error);
//     }
//   };

//   const isDarkMode = useColorScheme() === 'dark';
//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={[backgroundStyle, styles.container]}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <View style={{padding: 20}}>
//         <TouchableOpacity
//           activeOpacity={0.5}
//           style={styles.scanButton}
//           onPress={scanForDevices}>
//           <Text style={styles.scanButtonText}>
//             {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
//           </Text>
//         </TouchableOpacity>
//         <Text
//           style={[
//             styles.subtitle,
//             {color: isDarkMode ? Colors.white : Colors.black},
//           ]}>
//           Discovered Devices:
//         </Text>
//         {devices.length > 0 ? (
//           <>
//             <FlatList
//               data={devices}
//               keyExtractor={item => item.id}
//               renderItem={({item}) => (
//                 <View style={styles.deviceContainer}>
//                   <View style={styles.deviceItem}>
//                     <Text style={styles.deviceName}>
//                       {item.name || 'Unnamed Device'}
//                     </Text>
//                     <Text style={styles.deviceId}>{item.id}</Text>
//                     <TouchableOpacity
//                       activeOpacity={0.5}
//                       style={styles.connectButton}
//                       onPress={() => connectToDevice(item)}>
//                       <Text style={styles.connectButtonText}>
//                         {connectingToDevice ? 'Connecting...' : 'Connect'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             />
//           </>
//         ) : (
//           <Text style={styles.noDeviceText}>No devices found.</Text>
//         )}
//         <Text
//           style={[
//             styles.subtitle,
//             {color: isDarkMode ? Colors.white : Colors.black},
//           ]}>
//           Connected Devices:
//         </Text>
//         {connectedDevices.length > 0 ? (
//           <>
//             <FlatList
//               data={connectedDevices.filter(device => device && device.id)}
//               keyExtractor={item => item.id}
//               renderItem={({item}) => (
//                 <View style={styles.deviceContainer}>
//                   <View style={styles.deviceItem}>
//                     <Text style={styles.deviceName}>
//                       {item.name || 'Unnamed Device'}
//                     </Text>
//                     <Text style={styles.deviceId}>{item.id}</Text>
//                     <TouchableOpacity
//                       activeOpacity={0.5}
//                       style={styles.disconnectButton}
//                       onPress={() => disconnectFromDevice(item)}>
//                       <Text style={styles.connectButtonText}>Disconnect</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             />
//           </>
//         ) : (
//           <Text style={styles.noDeviceText}>No devices connected.</Text>
//         )}
//         {batteryPercentage !== null && (
//           <Text
//             style={[
//               styles.batteryText,
//               {color: isDarkMode ? Colors.white : Colors.black},
//             ]}>
//             Battery Percentage: {batteryPercentage}%
//           </Text>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default BluetoothScanner;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  Alert,
  useColorScheme,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {request, PERMISSIONS, check, RESULTS} from 'react-native-permissions';
import {openSettings} from 'react-native-permissions';
import {styles} from './src/styles/styles';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import firestore from '@react-native-firebase/firestore';
import EncryptedStorage from 'react-native-encrypted-storage';
import NetInfo from '@react-native-community/netinfo';
const BluetoothScanner = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [manager, setManager] = useState(null);
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingToDevice, setConnectingToDevice] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);
    return () => {
      bleManager.destroy();
      setManager(null);
    };
  }, []);

  useEffect(() => {
    // Check network connectivity and sync local storage with Firestore if online
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('state.isConnected', state.isConnected);
      if (state.isConnected) {
        syncLocalDataWithFirestore();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch data from Firestore or local storage based on network availability
    const fetchData = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        console.log('111');
        fetchDataFromFirestore();
      } else {
        console.log('12222');
        fetchDataFromLocalStorage();
      }
    };
    fetchData();
  }, []);

  const checkPermissions = async () => {
    // await firestore().collection('myCollection').add('43');
    const bluetoothStatus = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
    const locationStatus = await check(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (bluetoothStatus === RESULTS.DENIED) {
      await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
    }

    if (locationStatus === RESULTS.DENIED) {
      await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }

    if (
      bluetoothStatus === RESULTS.BLOCKED ||
      locationStatus === RESULTS.BLOCKED
    ) {
      Alert.alert(
        'Permissions Required',
        'Bluetooth and Location permissions are required to scan for devices. Please enable them in the app settings.',
        [{text: 'Open Settings', onPress: openSettings}],
      );
    }
  };

  const scanForDevices = async () => {
    await checkPermissions();
    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }

      if (device) {
        setDevices(prevDevices => {
          if (!prevDevices.some(d => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const connectToDevice = async device => {
    try {
      if (!manager) {
        console.error('BleManager is not available.');
        return;
      }
      setConnectingToDevice(true);
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();

      readBatteryLevel(connectedDevice, device);
    } catch (error) {
      setConnectingToDevice(false);
      console.error('Connection failed', error);
    }
  };

  const reconnectDevice = async (bleManager) => {
    try {
      const devices = await bleManager.connectedDevices([]);
      if (devices.length > 0) {
        const device = devices[0]; // Assuming only one device was connected
        await device.discoverAllServicesAndCharacteristics();
        console.log('Reconnected to device:', device.id);
        return device;
      } else {
        console.log('No previously connected device found.');
        return null;
      }
    } catch (error) {
      console.error('Failed to reconnect:', error);
      return null;
    }
  };
  

  const disconnectFromDevice = async device => {
    try {
      console.log('%%%%%%',device)

      if (!device.isConnected) {
        device = await reconnectDevice(manager);
        if (!device) {
          console.warn('No device to disconnect');
          return;
        }
      }
  
      await manager.cancelDeviceConnection(device.id);
      await manager.cancelDeviceConnection(device.id);
      setConnectingToDevice(true);

      const updatedDevices = connectedDevices.filter(d => d.id !== device.id);

      console.log('updatedDevices', updatedDevices);
      console.log('device', device);
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        // Sync with Firestore if online
        const docRef = firestore()
          .collection('BatteryData')
          .doc('cVenm3ridGZfrILP6rDi');
        const docSnapshot = await docRef.get();

        if (docSnapshot.exists) {
          const fields = docSnapshot.data();

          // Prepare an update object to delete all fields
          const updateData = {};
          Object.keys(fields).forEach(field => {
            updateData[field] = firestore.FieldValue.delete();
          });

          // Update the document to clear all fields
          await docRef.update(updateData);
          console.log('All fields successfully deleted!');
        } else {
          console.log('Document does not exist!');
        }
      } else {
        // Save locally if offline
        const jsonData = JSON.stringify({});
        await EncryptedStorage.setItem('deviceData', jsonData);
        console.log('Device data saved to EncryptedStorage:', jsonData);
      }
      setDevices(prevDevices => [...prevDevices, device]);
      setConnectedDevices(updatedDevices);
      setConnectingToDevice(false);
    } catch (error) {
      setConnectingToDevice(false);

      console.error('Disconnection failed', error);
    }
  };

  const readBatteryLevel = async (connectedDevice, device) => {
    const services = await connectedDevice.services();

    for (const service of services) {
      const characteristics = await service.characteristics();
      for (const characteristic of characteristics) {
        if (
          service.uuid.includes('180f') &&
          characteristic.uuid.includes('2a19')
        ) {
          const data = await characteristic.read();
          const decodedValue = Buffer.from(data.value, 'base64');
          const batteryPercentage = decodedValue[0];
          // setBatteryPercentage(batteryPercentage);
          console.log('Battery Level:', batteryPercentage, '%');

          await saveBatteryPercentage(
            batteryPercentage,
            connectedDevice,
            device,
          );
        }
      }
    }
  };

  const saveBatteryPercentage = async (
    batteryPercentage,
    connectedDevice,
    device,
  ) => {
    try {
      const state = await NetInfo.fetch();
      let updatedConnectedDevices = [...connectedDevices, connectedDevice];

      const deviceData = {
        batteryPercentage: batteryPercentage,
        connectedDevices: updatedConnectedDevices, // Ensure no null values
        // connectedDevices: updatedConnectedDevices.filter(
        //   device => device && device.id,
        // ), // Ensure no null values
      };

      console.log(
        'deviceData 11111',
        deviceData,
        // connectedDevices,
        // updatedConnectedDevices,
      );

      if (state.isConnected) {
        // Sync with Firestore if online
        const documentRef = firestore()
          .collection('BatteryData')
          .doc('cVenm3ridGZfrILP6rDi');

        // Update the document with an empty object and timestamp
        await documentRef.update({
          ...deviceData, // Empty object
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        // await firestore()
        //   .collection('BatteryData')
        //   .add({
        //     ...deviceData,
        //     timestamp: firestore.FieldValue.serverTimestamp(),
        //   });
        console.log(
          'Battery percentage synced with Firestore:',
          batteryPercentage,
        );
      } else {
        // Save locally if offline
        const jsonData = JSON.stringify(deviceData);
        await EncryptedStorage.setItem('deviceData', jsonData);
        console.log('Device data saved to EncryptedStorage:', jsonData);
      }

      // Update local state

      setConnectedDevices(updatedConnectedDevices);
      setDevices(prevDevices => prevDevices.filter(d => d.id !== device.id));
      setBatteryPercentage(batteryPercentage);

      setConnectingToDevice(false);
    } catch (error) {
      setConnectingToDevice(false);
      console.error('Failed to save battery percentage:', error);
    }
  };

  const fetchDataFromFirestore = async () => {
    try {
      const snapshot = await firestore()
        .collection('BatteryData')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        console.log('Fetched data from Firestore:', data);

        setBatteryPercentage(data.batteryPercentage);
        setConnectedDevices(data.connectedDevices);
      }
    } catch (error) {
      console.error('Failed to fetch data from Firestore:', error);
    }
  };

  const fetchDataFromLocalStorage = async () => {
    try {
      // Retrieve the JSON string from EncryptedStorage
      const jsonData = await EncryptedStorage.getItem('deviceData');

      if (jsonData) {
        // Parse the JSON string back into an object
        const data = JSON.parse(jsonData);
        console.log('Device data fetched from EncryptedStorage:', data);

        // Now you can use the data as needed
        const batteryPercentage = data.batteryPercentage;
        const connectedDevices = data.connectedDevices;

        // For example, set these values back into state
        setBatteryPercentage(batteryPercentage);
        setConnectedDevices(connectedDevices);
      } else {
        console.log('No device data found in EncryptedStorage.');
      }
    } catch (error) {
      console.error('Failed to fetch device data:', error);
    }
  };

  const syncLocalDataWithFirestore = async () => {
    try {
      const jsonData = await EncryptedStorage.getItem('deviceData');
      if (jsonData) {
        const deviceData = JSON.parse(jsonData);

        const documentRef = firestore()
          .collection('BatteryData')
          .doc('cVenm3ridGZfrILP6rDi');

        // Update the document with an empty object and timestamp
        await documentRef.update({
          ...deviceData, // Empty object
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

        // // Add to Firestore
        // await firestore()
        //   .collection('BatteryData')
        //   .add({
        //     ...deviceData,
        //     timestamp: firestore.FieldValue.serverTimestamp(),
        //   });
        console.log('Local data synced with Firestore:', deviceData);

        // Clear local storage after successful sync
        // await EncryptedStorage.removeItem('deviceData');
      }
    } catch (error) {
      console.error('Failed to sync local data with Firestore:', error);
    }
  };

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{padding: 20}}>
        {/* <Button title="Search Devices" onPress={scanForDevices} /> */}
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.scanButton}
          onPress={scanForDevices}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.subtitle,
            {color: isDarkMode ? Colors.white : Colors.black},
          ]}>
          Discovered Devices:
        </Text>
        {devices?.length > 0 ? (
          <>
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.deviceContainer}>
                  <View style={styles.deviceItem}>
                    <Text style={styles.deviceName}>
                      {item.name || 'Unnamed Device'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => connectToDevice(item)}
                    style={styles.deviceButton}>
                    <Text
                      style={[
                        styles.scanButtonText,
                        {fontWeight: 'bold', fontSize: 16},
                      ]}>
                      {connectingToDevice ? 'Connecting...' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        ) : (
          <Text style={styles.subText}>no devices found</Text>
        )}
        <Text
          style={[
            styles.subtitle,
            {color: isDarkMode ? Colors.white : Colors.black},
          ]}>
          Connected Devices:
        </Text>
        {connectedDevices?.length > 0 ? (
          <>
            <FlatList
              data={connectedDevices}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.deviceContainer}>
                  <View style={styles.deviceItem}>
                    <Text style={styles.deviceName}>
                      {item.name || 'Unnamed Device'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => disconnectFromDevice(item)}
                    style={styles.deviceButton}>
                    <Text
                      style={[
                        styles.scanButtonText,
                        {fontWeight: 'bold', fontSize: 16},
                      ]}>
                      {connectingToDevice ? 'Disconnecting...' : 'Disconnect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <Text style={styles.deviceName}>
              Battery Level: {batteryPercentage} %
            </Text>
          </>
        ) : (
          <Text style={styles.subText}>no devices connected</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BluetoothScanner;
