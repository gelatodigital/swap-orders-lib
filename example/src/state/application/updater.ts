import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { useActiveWeb3React } from '../../hooks/web3'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../index'
import { NetworkInfo, EthereumNetworkInfo, GoerliNetworkInfo } from '../../constants/networks'

import { useBlockNumber } from './hooks'
import { setImplements3085, updateActiveNetworkVersion } from './actions'
import { switchToNetwork } from '../../utils/switchToNetwork'

function useBlockWarningTimer() {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const timeout = useRef<NodeJS.Timeout>()
  const isWindowVisible = useIsWindowVisible()
  const [msSinceLastBlock, setMsSinceLastBlock] = useState(0)
  const currentBlock = useBlockNumber()

  useEffect(() => {
    setMsSinceLastBlock(0)
  }, [currentBlock])

  useEffect(() => {
    return function cleanup() {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
    }
  }, [chainId, dispatch, isWindowVisible, msSinceLastBlock, setMsSinceLastBlock])
}

export default function Updater(): null {
  const { account, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const windowVisible = useIsWindowVisible()
  

  const [state, setState] = useState<{ activeNetworkVersion: NetworkInfo | undefined }>({ activeNetworkVersion: EthereumNetworkInfo })

  useBlockWarningTimer()

  // attach/detach listeners
  useEffect(() => {
    switch (chainId) {
      case 1:
        setState({ activeNetworkVersion: EthereumNetworkInfo });
        break;
      case 5:
        setState({ activeNetworkVersion: GoerliNetworkInfo });
        break;
      default:
        setState({ activeNetworkVersion: EthereumNetworkInfo });
        break;
    }
  }, [dispatch, chainId, library, windowVisible])

  const debouncedState = useDebounce(state, 100)
  useEffect(() => {
    if(debouncedState.activeNetworkVersion) {
      dispatch(
        updateActiveNetworkVersion({ activeNetworkVersion: debouncedState.activeNetworkVersion })
      )
    }
  }, [dispatch, debouncedState.activeNetworkVersion])

  useEffect(() => {
    if (!account || !library?.provider?.request || !library?.provider?.isMetaMask) {
      return
    }
    switchToNetwork({ library })
      .then((x: any) => x ?? dispatch(setImplements3085({ implements3085: true })))
      .catch(() => dispatch(setImplements3085({ implements3085: false })))
  }, [account, chainId, dispatch, library])

  return null
}