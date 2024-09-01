// simulateBluetoothDevice.js
const interval = setInterval(() => {
    const randomData = Math.floor(Math.random() * 100);
    console.log('Simulated Bluetooth Data:', randomData);
  }, 3000);
  
  // Stop the simulation after a certain period
  setTimeout(() => {
    clearInterval(interval);
  }, 30000);
  