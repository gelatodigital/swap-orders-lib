import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { TokenList, Version } from '@uniswap/token-lists'

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string }>
  rejected: ActionCreatorWithPayload<{ url: string; errorMessage: string; requestId: string }>
}> = {
  pending: createAction('glists/fetchTokenList/pending'),
  fulfilled: createAction('glists/fetchTokenList/fulfilled'),
  rejected: createAction('glists/fetchTokenList/rejected'),
}
// add and remove from list options
export const addList = createAction<string>('glists/addList')
export const removeList = createAction<string>('glists/removeList')

// select which lists to search across from loaded lists
export const enableList = createAction<string>('glists/enableList')
export const disableList = createAction<string>('glists/disableList')

// versioning
export const acceptListUpdate = createAction<string>('glists/acceptListUpdate')
export const rejectVersionUpdate = createAction<Version>('glists/rejectVersionUpdate')
