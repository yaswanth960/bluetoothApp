import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

const BluetoothScreen = () => {
  const [manager] = useState(new BleManager());
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission not granted');
        }
      }
    };
    requestPermissions();
  }, []);

  const scanDevices = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }
      if (device && !devices.some(d => d.id === device.id)) {
        console.log('jjjj')
        setDevices(prevDevices => [...prevDevices, device]);
      }
    });
  };

  const connectToDevice = async (device) => {
    try {
      await manager.stopDeviceScan();
      const connectedDevice = await manager.connectToDevice(device.id);
      setConnectedDevice(connectedDevice);
      simulateReadingData();
    } catch (error) {
      console.log('Connection error:', error);
    }
  };

  const simulateReadingData = () => {
    const randomData = Math.floor(Math.random() * 100);
    setData(randomData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Devices</Text>
      {connectedDevice ? (
        <View>
          <Text>Connected to {connectedDevice.name}</Text>
          <Text>Data: {data}</Text>
        </View>
      ) : (
        <>
          <Button title="Scan for Devices" onPress={scanDevices} />
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Button
                title={`Connect to ${item.name}`}
                onPress={() => connectToDevice(item)}
              />
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BluetoothScreen;
