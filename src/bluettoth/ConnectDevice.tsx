import { FlatList, Image, NativeEventEmitter, NativeModules, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BleManager from 'react-native-ble-manager';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';


import { colors } from '../utils/colors';
import { HUMIDITY_UUID, TEMPERATURE_UUID } from './BleConstants';
import RippleEffect from '../components/RippleEffect';
import { fonts, fontSize } from '../utils/fonts';
const ConnectDevice = () => {
    const [bluetoothDevices, setBluetoothDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const BleManagerModule = NativeModules.BleManager;
    const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
    const [currentDevice, setCurrentDevice] = useState(null)
    const [temperature, setTemperature] = useState<string | null>(null);
    const [humidity, setHumidity] = useState<string | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [status, setStatus] = useState<string>('Lock');
    useEffect(() => {
        BleManager.enableBluetooth().then(() => {
            console.log('Bluetooth is turned on!');
        });
        requestPermission();

        return () => { };
    }, []);

    useEffect(() => {
        BleManager.start({ showAlert: false }).then(() => {
            console.log('BleManager initialized');
        });
    }, []);

    const requestPermission = async () => {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        // startScanning()
    };

    const startScanning = () => {
        if (!isScanning) {
            BleManager.scan([], 10, true)
                .then(() => {
                    console.log('Scan is started.....');

                    setIsScanning(true);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    };

    useEffect(() => {
        let stopListener = BleManagerEmitter.addListener(
            'BleManagerStopScan',
            () => {
                setIsScanning(false);
                console.log('Scan is stopped');
                handleGetConnectedDevices();
            },
        );

        let disconnected = BleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            peripheral => {
                console.log('Disconnected Device', peripheral);
            },
        );

        let characteristicValueUpdate = BleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            data => {
                // Handle received data
                // bleServices.onCharacteristicChanged(data);

                readCharacteristicFromEvent(data)
            },
        );
        let BleManagerDidUpdateState = BleManagerEmitter.addListener(
            'BleManagerDidUpdateState',
            data => {
                // Handle received data
                console.log('BleManagerDidUpdateState Event!', data);
            },
        );

        return () => {
            stopListener.remove();
            disconnected.remove();
            characteristicValueUpdate.remove();
            BleManagerDidUpdateState.remove();
        };
    }, [bluetoothDevices]);

    const handleGetConnectedDevices = () => {
        BleManager.getDiscoveredPeripherals().then((results: any) => {
            if (results.length == 0) {
                console.log('No connected bluetooth devices');
                startScanning();
            } else {
                const allDevices = results.filter((item: any) => item.name !== null)
                setBluetoothDevices(allDevices)
            }
        });
    };

    const onConnect = async (item: any, index: number) => {
        console.log("CONNECTED DEVICE:::", item)
        try {
            await BleManager.connect(item.id);
            console.log('Connected');
            setCurrentDevice(item)

            const res = await BleManager.retrieveServices(item.id);
            console.log("RES::::", JSON.stringify(res))
            onServicesDiscovered(res, item)
            startDistanceCheck(item)
        } catch (error) {
            // Failure code
            console.error(error);
        }
    };

    const onDisconnect = () => {
        BleManager.disconnect(currentDevice?.id).then(() => {
            setCurrentDevice(null)
            clearInterval(distanceInterval);
            setStatus('Lock');
        })
    }

    const onServicesDiscovered = (result: any, item: any) => {
        const services = result?.services;
        const characteristics = result?.characteristics;

        services.forEach((service: any) => {
            const serviceUUID = service.uuid;

            onChangeCharacteristics(serviceUUID, characteristics, item)
        });
    };

    const onChangeCharacteristics = (serviceUUID: any, result: any, item: any) => {
        console.log("SERVICE UUIDS:::", serviceUUID)
        // console.log("RESULT", result)
        result.forEach((characteristic: any) => {
            const characteristicUUID = characteristic.characteristic
            if (characteristicUUID === "00002a01-0000-1000-8000-00805f9b34fb") {
                readCharacteristic(characteristicUUID, serviceUUID, item)
            }
            if (characteristicUUID === TEMPERATURE_UUID || characteristicUUID === HUMIDITY_UUID) {
                BleManager.startNotification(item.id, serviceUUID, characteristicUUID)
                    .then(() => {
                        console.log('Notification started for characteristic:', characteristicUUID);
                    })
                    .catch(error => {
                        console.error('Notification error:', error);
                    });
            }

        })

    }

    const readCharacteristicFromEvent = (data: any) => {
        const { characteristic, value } = data;

        if (characteristic === TEMPERATURE_UUID) {
            const temperature = bytesToString(value);
            setTemperature(temperature);
            console.log('Temperature:', temperature);
        } else if (characteristic === HUMIDITY_UUID) {
            const humidity = bytesToString(value);
            setHumidity(humidity);
            console.log('Humidity:', humidity);
        }

    };
    const readCharacteristic = (characteristicUUID: any, serviceUUID: any, item: any) => {
        console.log("CURRENT DEVICE ID:::", item?.id)

        BleManager.read(item.id, serviceUUID, characteristicUUID)
            .then(result => {
                if (characteristicUUID === "2a01") {
                    console.log("CHARACTERISTIC " + characteristicUUID, result)
                    extractDeviceName(result)
                }
            })
            .catch(error => {
                console.error('Error during BLE read:', error);
            });


    };

    const extractDeviceName = (valueArray: any) => {
        const deviceName = bytesToString(valueArray);
        console.log("DEVICE NAME:::", deviceName)
    };

    const bytesToString = (bytes: any) => {
        return String.fromCharCode(...bytes);
    };


    const calculateDistance = (rssi: number) => {
        const txPower = -59; // Adjust this value based on your device's TX power
        if (rssi === 0) {
            return -1.0;
        }

        const ratio = rssi * 1.0 / txPower;

        console.log("RATIO::::", ratio)
        if (ratio < 1.0) {
            console.log("RATIO<1::::", ratio, Math.pow(ratio, 10))

            return Math.pow(ratio, 10);
        } else {
            const distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
            return distance;
        }
    };

    let distanceInterval: NodeJS.Timeout;

    const startDistanceCheck = (item: any) => {
        distanceInterval = setInterval(() => {
            BleManager.readRSSI(item.id)
                .then(rssi => {
                    const distance = calculateDistance(rssi);
                    setDistance(distance);
                    setStatus(distance < 3 ? 'Unlock' : 'Lock');
                })
                .catch(error => {
                    console.error('Error reading RSSI:', error);
                });
        }, 3000); // Adjust the interval time as needed
    };
    const renderItem = ({ item, index }: any) => {
        console.log("BLE ITEM:::", JSON.stringify(item))
        return (
            <View>
                <View style={styles.bleCard}>
                    <Text style={styles.nameTxt}>{item.name}</Text>
                    <TouchableOpacity onPress={() => item.id === currentDevice?.id ? onDisconnect() : onConnect(item, index)} style={styles.button}>
                        <Text style={styles.btnTxt}>{item.id === currentDevice?.id ? "Disconnect" : "Connect"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

        )
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.fullRow}>
                {/* <View style={styles.tempCard}>
                    <Text style={styles.label}>{status == "Lock" ? "Locked" : "Unlocked"}</Text>
                    <Image style={styles.icon} source={status == "Lock" ? require('../../assets/images/locked.png') : require('../../assets/images/unlocked.png')} />
                    <Text style={styles.label}>{`${distance ? distance.toFixed(2) + "m" : "N/A"}`}</Text>
                </View> */}
                <View style={styles.tempCard}>
                    <Text style={styles.label}>Temperature</Text>
                    <Image style={styles.icon} source={{uri:'data:image/jpeg;base64,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'}} />
                    <Text style={styles.label}>{temperature ? temperature : 'N/A'} °C</Text>
                </View>
                <View style={styles.tempCard}>
                    <Text style={styles.label}>Humidity</Text>
                    {/* <Image style={styles.icon} source={require('../../assets/images/humidity.png')} /> */}
                    <Text style={styles.label}>{humidity ? humidity : 'N/A'} %</Text>
                </View>
            </View>
            {isScanning ? <View style={{
                flex: 1, justifyContent: "center",
                alignItems: "center"
            }}>

                <RippleEffect />
            </View> :

                <FlatList data={bluetoothDevices}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                />
            }



            <TouchableOpacity onPress={() => startScanning()} style={styles.scanBtn}>
                <Text style={styles.btnTxt}>Start Scan</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ConnectDevice

const styles = StyleSheet.create({
    bleCard: {
        width: "90%",
        padding: 10,
        alignSelf: "center",
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.secondary,
        elevation: 5,
        borderRadius: 5
    },
    nameTxt: {
        fontFamily: fonts.bold,
        fontSize: fontSize.font18,
        color: colors.text
    },
    button: {
        width: 100,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 5
    },
    btnTxt: {
        fontFamily: fonts.bold,
        fontSize: fontSize.font18,
        color: colors.white
    },
    label: {
        fontSize: 20,
        textAlign: 'center',
        color: colors.text,
        fontFamily: fonts.bold,
    },
    icon: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        marginVertical: hp(2)
    },
    tempCard: {
        width: wp(45),
        backgroundColor: colors.secondary,
        elevation: 2,
        paddingVertical: hp(1.5),
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    fullRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: hp(2),
        alignSelf: "center"
    },
    scanBtn: {
        width: "90%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 5,
        alignSelf: "center",
        marginBottom: hp(2)
    }
})