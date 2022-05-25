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
      factory={"0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"}
      initCodeHash={"0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"}
      router={"0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff"}
      bases={[]}
      tokenListURLs={[]}
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
