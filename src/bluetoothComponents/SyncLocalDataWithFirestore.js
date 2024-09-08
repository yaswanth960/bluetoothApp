
import {firestore} from '../../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import SQLite from 'react-native-sqlite-storage';


const db = SQLite.openDatabase({name: 'app.db', location: 'default'});

export const syncLocalDataWithFirestore = async () => {
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

  export const fetchDataFromFirestore = async () => {
    try {
      // Fetch battery data
      const batteryDocumentRef = firestore()
        .collection('BatteryData')
        .doc('cVenm3ridGZfrILP6rDi'); // Use the same document ID
      const batteryDocumentSnapshot = await batteryDocumentRef.get();
  
      let batteryData = null;
      if (batteryDocumentSnapshot.exists) {
        const data = batteryDocumentSnapshot.data();
        batteryData = {
          batteryPercentage: data.batteryPercentage || 0,
          connectedDevices: JSON.parse(data.connectedDevices || '[]')
        };
      } else {
        console.log('Battery document does not exist');
      }
  
      // Fetch random data
      const randomDataDocumentRef = firestore()
        .collection('randomData')
        .doc('z2ivDSv7ubr1BlnKTdmW'); // Use the same document ID
      const randomDataDocumentSnapshot = await randomDataDocumentRef.get();
  
      let randomData = null;
      if (randomDataDocumentSnapshot.exists) {
        const data = randomDataDocumentSnapshot.data();
        randomData = {
          data: data.data || [],
          // timestamp: data.timestamp?.toDate() || null // Uncomment if you need timestamp
        };
      } else {
        console.log('Random data document does not exist');
      }
  
      // Return the combined data
      return {
        batteryData,
        randomData
      };
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
      // Optionally, return null or some error indicator
      return {
        batteryData: null,
        randomData: null
      };
    }
  };
  