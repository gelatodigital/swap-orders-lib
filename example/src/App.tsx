import React from 'react';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from "@gelatonetwork/limit-orders-react";
import './App.css';

function App() {
  return (
    <div className="App">
      <GelatoLimitOrderPanel />
      <GelatoLimitOrdersHistoryPanel />
    </div>
  );
}

export default App;
