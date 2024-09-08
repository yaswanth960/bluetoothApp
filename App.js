import React from 'react'
import ErrorBoundary from './src/components/coachesComponents/ErrorBoundary'
import SimulateBluetoothDevice from './src/bluetoothComponents/SimulateBluetoothDevice'

const App = () => {
  return (
    <ErrorBoundary>
    <SimulateBluetoothDevice />
  </ErrorBoundary>
  )
}

export default App