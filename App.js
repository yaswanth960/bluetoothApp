import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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

      readBatteryLevel(connectedDevice, device);
    } catch (error) {
      setConnectingToDevice(false);
      console.error('Connection failed', error);
    }
  };

  const disconnectFromDevice = async device => {
    try {
      await manager.cancelDeviceConnection(device.id);
      setConnectingToDevice(true);
      const updatedDevices = connectedDevices.filter(d => d.id !== device.id);
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        // Sync with Firestore if online

        const documentRef = firestore()
          .collection('BatteryData')
          .doc('cVenm3ridGZfrILP6rDi');

        // Fetch the document to get all fields
        documentRef
          .get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data();

              // Prepare the update object to delete all fields
              const updates = {};
              Object.keys(data).forEach(field => {
                updates[field] = FieldValue.delete();
              });

              // Update the document to delete all fields
              documentRef
                .update(updates)
                .then(() => {
                  console.log('All fields deleted successfully');
                })
                .catch(error => {
                  console.error('Error deleting fields:', error);
                });
            } else {
              console.log('Document does not exist');
            }
          })
          .catch(error => {
            console.error('Error fetching document:', error);
          });
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
      };

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
