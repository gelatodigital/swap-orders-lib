import React from 'react';
import {
  GelatoStopLimitOrderPanel,
  GelatoStopLimitOrdersHistoryPanel,
} from "@gelatonetwork/stop-limit-orders-react";
import './App.css';

function App() {
  return (
    <div className="App">
      <GelatoStopLimitOrderPanel />
      <GelatoStopLimitOrdersHistoryPanel />
    </div>
  );
}

export default App;
