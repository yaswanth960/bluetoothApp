import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
//   StatusBar,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
const db = SQLite.openDatabase({name: 'app.db', location: 'default'});
import SQLite from 'react-native-sqlite-storage';
import { styles } from '../styles/styles';
const BluetoothScanner = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [manager, setManager] = useState(null);
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingToDevice, setConnectingToDevice] = useState(false);
  const [randomNumbers, setRandomNumbers] = useState([]);

  let lastUpdateTimestamp = 0;
  const UPDATE_INTERVAL = 10000;

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
        fetchDataFromFirestore();
      } else {
        fetchDataFromLocalStorage();
      }
    };
    fetchData();
  }, []);

  const checkPermissions = async () => {
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
      console.log('connectedDevice', connectedDevice);

      readBatteryLevel(connectedDevice, device);
    } catch (error) {
      setConnectingToDevice(false);
      console.error('Connection failed', error);
    }
  };
  const intervalIdRef = useRef(null); // Use ref to store interval ID

  const startGeneratingRandomData = () => {
    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * 100); // Generate random number
      setRandomNumbers(prevNumbers => {
        const updatedNumbers = [...prevNumbers, randomNumber];
        saveRandomData(updatedNumbers);
        return updatedNumbers;
      });
    }, 1000); // Update every second

    // Stop the interval after 2 minutes (120,000 milliseconds)
    const timeoutId = setTimeout(() => {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null; // Clear the reference
    }, 120000); // 2 minutes

    // Clean up interval and timeout on component unmount
    return () => {
      clearInterval(intervalIdRef.current);
      clearTimeout(timeoutId);
    };
  };

  const saveRandomData = async randomData => {
    const now = Date.now();

    if (now - lastUpdateTimestamp < UPDATE_INTERVAL) {
      // If the time since last update is less than the interval, skip the update
      return;
    }

    lastUpdateTimestamp = now;
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        // Sync with Firestore if online
        await firestore()
          .collection('randomData')
          .doc('z2ivDSv7ubr1BlnKTdmW')
          .update({
            data: randomData,
            timestamp: firestore.FieldValue.serverTimestamp(),
          });
      } else {
        // Save locally if offline
        await db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS randomData (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)',
            [],
            () => {
              tx.executeSql(
                'DELETE FROM randomData', // Clear old data
                [],
                () => {
                  tx.executeSql(
                    'INSERT INTO randomData (data) VALUES (?)',
                    [JSON.stringify(randomData)],
                    () => console.log('Random data saved to SQLite.'),
                    (_, error) =>
                      console.error(
                        'Failed to save random data to SQLite:',
                        error,
                      ),
                  );
                },
                (_, error) =>
                  console.error(
                    'Failed to clear random data in SQLite:',
                    error,
                  ),
              );
            },
            (_, error) =>
              console.error('Failed to create randomData table:', error),
          );
        });
      }
    } catch (error) {
      console.error('Failed to save random data:', error);
    }
  };

  const disconnectFromDevice = async device => {
    try {
      stopGeneratingRandomData();
      await manager.cancelDeviceConnection(device.id);
      setConnectingToDevice(true);
      const updatedDevices = connectedDevices.filter(d => d.id !== device.id);
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        // Sync with Firestore if online
        // Clear fields from 'BatteryData' document
        await clearDocumentFields('BatteryData', 'cVenm3ridGZfrILP6rDi');

        // Clear fields from 'randomData' document
        await clearDocumentFields('randomData', 'z2ivDSv7ubr1BlnKTdmW');

        console.log('All specified document fields have been cleared.');
      } else {
        // Save locally if offline
        await clearBatteryData();
        await clearRandomData();
      }
      setDevices(prevDevices => [...prevDevices, device]);
      setConnectedDevices(updatedDevices);
      setConnectingToDevice(false);
    } catch (error) {
      setConnectingToDevice(false);
      console.error('Disconnection failed', error);
    }
  };

  const stopGeneratingRandomData = () => {
    console.log('1111', intervalIdRef.current);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null; // Clear the reference
      console.log('Random data generation stopped.');
    }
  };

  const clearBatteryData = async () => {
    try {
      await db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM batteryData', // Clear all rows from the table
          [],
          () => console.log('All battery data cleared from SQLite.'),
          (_, error) =>
            console.error('Failed to clear battery data from SQLite:', error),
        );
      });
    } catch (error) {
      console.error('Failed to clear battery data:', error);
    }
  };

  const clearRandomData = async () => {
    try {
      await db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM randomData', // Clear all rows from the table
          [],
          () => console.log('All random data cleared from SQLite.'),
          (_, error) =>
            console.error('Failed to clear random data from SQLite:', error),
        );
      });
    } catch (error) {
      console.error('Failed to clear random data:', error);
    }
  };

  const clearDocumentFields = async (collectionName, docId) => {
    try {
      const documentRef = firestore().collection(collectionName).doc(docId);

      // Fetch the document
      const doc = await documentRef.get();

      if (doc.exists) {
        const data = doc.data();
        const updates = {};

        // Prepare update object to delete all fields
        Object.keys(data).forEach(field => {
          updates[field] = firestore.FieldValue.delete();
        });

        // Update the document to delete all fields
        await documentRef.update(updates);
        console.log(
          `All fields deleted successfully from ${collectionName}/${docId}`,
        );
      } else {
        console.log(`Document ${collectionName}/${docId} does not exist.`);
      }
    } catch (error) {
      console.error(
        `Error deleting fields from ${collectionName}/${docId}:`,
        error,
      );
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
          console.log('Battery Level:', batteryPercentage, '%');

          await saveBatteryPercentage(
            batteryPercentage,
            connectedDevice,
            device,
          );
          startGeneratingRandomData();
        }
      }
    }
  };

  const saveBatteryPercentage = async (
    batteryPercentage,
    connectedDevice,
    device,
  ) => {
    const now = Date.now();

    if (now - lastUpdateTimestamp < UPDATE_INTERVAL) {
      // If the time since last update is less than the interval, skip the update
      return;
    }

    lastUpdateTimestamp = now;
    try {
      const state = await NetInfo.fetch();
      let updatedConnectedDevices = [...connectedDevices, connectedDevice];

      const deviceData = {
        batteryPercentage: batteryPercentage,
        connectedDevices: JSON.stringify(updatedConnectedDevices), // Convert array to JSON string
      };

      if (state.isConnected) {
        // Sync with Firestore if online
        const documentRef = firestore()
          .collection('BatteryData')
          .doc('cVenm3ridGZfrILP6rDi');

        // Update the document with an empty object and timestamp
        await documentRef.update({
          ...deviceData,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Save locally if offline
        await db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS batteryData (id INTEGER PRIMARY KEY AUTOINCREMENT, batteryPercentage INTEGER, connectedDevices TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)',
            [],
            () => {
              tx.executeSql(
                'INSERT INTO batteryData (batteryPercentage, connectedDevices) VALUES (?, ?)',
                [batteryPercentage, deviceData.connectedDevices],
                () =>
                  console.log(
                    'Battery percentage and connected devices saved to SQLite.',
                  ),
                (_, error) =>
                  console.error(
                    'Failed to save battery data to SQLite:',
                    error,
                  ),
              );
            },
            (_, error) =>
              console.error('Failed to create batteryData table:', error),
          );
        });
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
      // Fetch batteryData
      const batteryDoc = await firestore()
        .collection('BatteryData')
        .doc('cVenm3ridGZfrILP6rDi')
        .get();

      if (batteryDoc.exists) {
        const batteryData = batteryDoc.data();
        const batteryPercentage = batteryData.batteryPercentage || 0;
        const connectedDevices = JSON.parse(
          batteryData.connectedDevices || '[]',
        );
        setBatteryPercentage(batteryPercentage);
        setConnectedDevices(connectedDevices);
      }

      // Fetch randomData
      const randomDataDoc = await firestore()
        .collection('randomData')
        .doc('z2ivDSv7ubr1BlnKTdmW')
        .get();

      if (randomDataDoc.exists) {
        const randomData = randomDataDoc.data();
        setRandomNumbers(randomData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data from Firestore:', error);
    }
  };

  const fetchDataFromLocalStorage = async () => {
    try {
      await db.transaction(tx => {
        // Fetch randomData
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS randomData (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)',
          [],
          () => {
            tx.executeSql(
              'SELECT * FROM randomData',
              [],
              (_, {rows}) => {
                if (rows.length > 0) {
                  const data = JSON.parse(rows.item(0).data);
                  setRandomNumbers(data);
                }
              },
              (_, error) =>
                console.error(
                  'Failed to fetch data from SQLite (randomData):',
                  error,
                ),
            );
          },
          (_, error) =>
            console.error(
              'Failed to create randomData table in SQLite:',
              error,
            ),
        );

        // Fetch batteryData
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS batteryData (id INTEGER PRIMARY KEY AUTOINCREMENT, batteryPercentage INTEGER, connectedDevices TEXT, timestamp INTEGER)',
          [],
          () => {
            tx.executeSql(
              'SELECT * FROM batteryData ORDER BY timestamp DESC LIMIT 1',
              [],
              (_, {rows}) => {
                if (rows.length > 0) {
                  const row = rows.item(0);
                  const batteryPercentage = row.batteryPercentage;
                  const connectedDevices = JSON.parse(row.connectedDevices);

                  // Update states
                  setBatteryPercentage(batteryPercentage);
                  setConnectedDevices(connectedDevices);
                }
              },
              (_, error) =>
                console.error(
                  'Failed to fetch data from SQLite (batteryData):',
                  error,
                ),
            );
          },
          (_, error) =>
            console.error(
              'Failed to create batteryData table in SQLite:',
              error,
            ),
        );
      });
    } catch (error) {
      console.error('Failed to fetch data from local storage:', error);
    }
  };

  const syncLocalDataWithFirestore = async () => {
    try {
      // Check network connectivity
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected;

      await db.transaction(async tx => {
        // Fetch randomData
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS randomData (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)',
          [],
          () => {
            tx.executeSql(
              'SELECT * FROM randomData',
              [],
              async (_, {rows}) => {
                if (rows.length > 0) {
                  const data = JSON.parse(rows.item(0).data);
                  // setRandomNumbers(data);

                  // Sync with Firestore if online
                  if (isConnected) {
                    await firestore()
                      .collection('randomData')
                      .doc('z2ivDSv7ubr1BlnKTdmW')
                      .update({data});
                  }
                }
              },
              (_, error) =>
                console.error(
                  'Failed to fetch data from SQLite (randomData):',
                  error,
                ),
            );
          },
          (_, error) =>
            console.error(
              'Failed to create randomData table in SQLite:',
              error,
            ),
        );

        // Fetch batteryData
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS batteryData (id INTEGER PRIMARY KEY AUTOINCREMENT, batteryPercentage INTEGER, connectedDevices TEXT, timestamp INTEGER)',
          [],
          () => {
            tx.executeSql(
              'SELECT * FROM batteryData ORDER BY timestamp DESC LIMIT 1',
              [],
              async (_, {rows}) => {
                if (rows.length > 0) {
                  const row = rows.item(0);
                  const batteryPercentage = row.batteryPercentage;
                  const connectedDevices = JSON.parse(row.connectedDevices);

                  // Sync with Firestore if online
                  if (isConnected) {
                    await firestore()
                      .collection('BatteryData')
                      .doc('cVenm3ridGZfrILP6rDi')
                      .update({
                        batteryPercentage,
                        connectedDevices,
                        timestamp: firestore.FieldValue.serverTimestamp(),
                      });
                  }
                }
              },
              (_, error) =>
                console.error(
                  'Failed to fetch data from SQLite (batteryData):',
                  error,
                ),
            );
          },
          (_, error) =>
            console.error(
              'Failed to create batteryData table in SQLite:',
              error,
            ),
        );
      });
    } catch (error) {
      console.error('Failed to fetch data from local storage:', error);
    }
  };

  const renderItem = ({item}) => (
    <View style={style.itemContainer}>
      <Text style={style.itemText}>{item}</Text>
    </View>
  );

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      {/* <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      /> */}
      <View style={{padding: 20}}>
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
        <Text>Random Data:</Text>
        <FlatList
          data={randomNumbers}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={style.listContainer} // Padding around the list
          initialNumToRender={10}
        />
      </View>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  listContainer: {
    padding: 16, // Padding inside the FlatList
  },
  itemContainer: {
    padding: 16, // Padding inside each item
    marginBottom: 2, // Margin between each item
    backgroundColor: '#f0f0f0', // Example background color for items
    borderRadius: 8, // Optional: rounded corners for items
  },
  itemText: {
    fontSize: 16,
    color: '#333', // Example text color
  },
});

export default BluetoothScanner;
