import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import { Provider } from 'react-redux';
import { NetworkContextName } from './constants/misc';
import { useActiveWeb3React } from './hooks/web3';
import { useWalletModalToggle } from './state/application/hooks';
import getLibrary from './utils/getLibrary';
import store from './state';
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

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
      {children}
    </GelatoProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <ThemeProvider>
          <ThemedGlobalStyle />
          <Gelato>
            <App />
          </Gelato>
          </ThemeProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
