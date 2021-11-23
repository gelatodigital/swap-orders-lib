import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { NetworkInfo } from '../../constants/networks'

export type PopupContent =
  | {
      txn: {
        hash: string
        success: boolean
        summary?: string
      }
    }
  | {
      listUpdate: {
        listUrl: string
        oldList: TokenList
        newList: TokenList
        auto: boolean
      }
    }

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE,
  POOL_OVERVIEW_OPTIONS,
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>(
  'gapplication/updateBlockNumber'
)
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup =
  createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>('application/addPopup')
export const removePopup = createAction<{ key: string }>('application/removePopup')

export const setImplements3085 = createAction<{ implements3085: boolean }>('application/setImplements3085')
export const updateActiveNetworkVersion = createAction<{ activeNetworkVersion: NetworkInfo }>(
  'application/updateActiveNetworkVersion'
)