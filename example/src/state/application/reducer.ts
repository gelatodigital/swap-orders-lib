import { createReducer, nanoid } from '@reduxjs/toolkit'
import { NetworkInfo } from '../../constants/networks'
import { addPopup, PopupContent, removePopup, updateBlockNumber, ApplicationModal, setOpenModal, setImplements3085, updateActiveNetworkVersion } from './actions'
import { EthereumNetworkInfo } from '../../constants/networks'


type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly activeNetworkVersion: NetworkInfo
  readonly implements3085: boolean
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  activeNetworkVersion: EthereumNetworkInfo,
  implements3085: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 25000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(setImplements3085, (state, { payload: { implements3085 } }) => {
      state.implements3085 = implements3085
    })
    .addCase(updateActiveNetworkVersion, (state, action) => {
      const { activeNetworkVersion } = action.payload
      state.activeNetworkVersion = activeNetworkVersion
    })
)
