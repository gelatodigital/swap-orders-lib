import React from 'react'
import { GelatoLimitOrderPanel, GelatoLimitOrdersHistoryPanel } from '@gelatonetwork/limit-orders-react'

export default function LimitOrder() {
  return (
    <>
      <GelatoLimitOrderPanel />
      <GelatoLimitOrdersHistoryPanel />
    </>
  )
}
