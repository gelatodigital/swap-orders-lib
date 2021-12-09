import React from 'react'
import { GelatoStopLimitOrderPanel, GelatoStopLimitOrdersHistoryPanel } from '@gelatonetwork/stop-limit-orders-react'

export default function StopLimitOrder() {
  return (
    <>
      <GelatoStopLimitOrderPanel />
      <GelatoStopLimitOrdersHistoryPanel />
    </>
  )
}
