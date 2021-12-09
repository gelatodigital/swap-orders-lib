import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { NetworkContextName } from './constants/misc'
import App from './App'
import store from './state'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'
import { GelatoProvider } from '@gelatonetwork/limit-orders-react'
import { GelatoProvider as StopLimitProvider } from '@gelatonetwork/stop-limit-orders-react'
import { useActiveWeb3React } from './hooks/web3'
import { useWalletModalToggle } from './state/application/hooks'
import ApplicationUpdater from './state/application/updater'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
    </>
  )
}

function Gelato({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}
      toggleWalletModal={toggleWalletModal}
      useDefaultTheme={false}
    >
      <StopLimitProvider
        library={library}
        chainId={chainId}
        account={account ?? undefined}
        toggleWalletModal={toggleWalletModal}
        useDefaultTheme={false}
      >
        {children}
      </StopLimitProvider>
    </GelatoProvider>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <ThemeProvider>
            <Updaters />
            <ThemedGlobalStyle />
            <HashRouter>
              <Gelato>
                <App />
              </Gelato>
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)