import React from 'react'
import { GelatoLimitOrderPanel, GelatoLimitOrdersHistoryPanel, GelatoProvider } from '@gelatonetwork/limit-orders-react'
import { useActiveWeb3React } from '../../hooks/web3'
import { useWalletModalToggle } from '../../state/application/hooks'

function Gelato({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  // Set your own bases if you want specific tokens as bases, otherwise leave undefined for default ones (see constants/routing)
  const customBases = [
    {
      chainId: 25,
      address: "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
      decimals: 18,
      symbol: "MMF",
      name: "Mad Meerkat Finance",
    }
  ]

  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}
      toggleWalletModal={toggleWalletModal}
      useDefaultTheme={false}
      handler={"mmfinance"}
      bases={customBases}
      tokenListURLs={["https://raw.githubusercontent.com/HarryTgerman/vvs-tokenlist/main/vvs-tokenlist.json"]}
    >
      {children}
    </GelatoProvider>
  )
}

export default function LimitOrder() {
  return (
    <Gelato>
      <GelatoLimitOrderPanel />
      <GelatoLimitOrdersHistoryPanel />
    </Gelato>
  )
}
