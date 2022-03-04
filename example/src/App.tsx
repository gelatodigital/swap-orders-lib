import React from 'react';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from "@gelatonetwork/limit-orders-react";
// import {
//   GelatoStopLimitOrderPanel,
//   GelatoStopLimitOrdersHistoryPanel
// } from "@gelatonetwork/stop-limit-orders-react";
import './App.css';

function App() {
  return (
    <div className="App">
      <GelatoLimitOrderPanel />
      <GelatoLimitOrdersHistoryPanel />
      {/* <GelatoStopLimitOrderPanel />
      <GelatoStopLimitOrdersHistoryPanel /> */}
    </div>
  );
}

export default App;
