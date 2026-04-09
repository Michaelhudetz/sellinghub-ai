import { useState } from 'react'
import produce from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'

const storageConversationIdKey = 'conversationIdInfo'

type ConversationInfoType = Omit<ConversationItem, 'inputs' | 'id'>
function useConversation() {
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [currConversationId, doSetCurrConversationId, getCurrConversationId] = useGetState<string>('-1')
  // when set conversation id, we do not have set appId
  // key is `appId:userId` so different users on the same browser do not share conversation state
  const setCurrConversationId = (id: string, appId: string, isSetToLocalStroge = true, userId = '') => {
    doSetCurrConversationId(id)
    if (isSetToLocalStroge && id !== '-1') {
      const storageKey = userId ? `${appId}:${userId}` : appId
      const conversationIdInfo = globalThis.localStorage?.getItem(storageConversationIdKey) ? JSON.parse(globalThis.localStorage?.getItem(storageConversationIdKey) || '') : {}
      conversationIdInfo[storageKey] = id
      globalThis.localStorage?.setItem(storageConversationIdKey, JSON.stringify(conversationIdInfo))
    }
  }

  const getConversationIdFromStorage = (appId: string, userId = '') => {
    const storageKey = userId ? `${appId}:${userId}` : appId
    const conversationIdInfo = globalThis.localStorage?.getItem(storageConversationIdKey) ? JSON.parse(globalThis.localStorage?.getItem(storageConversationIdKey) || '') : {}
    const id = conversationIdInfo[storageKey]
    return id
  }

  const isNewConversation = currConversationId === '-1'
  // input can be updated by user
  const [newConversationInputs, setNewConversationInputs] = useState<Record<string, any> | null>(null)
  const resetNewConversationInputs = () => {
    if (!newConversationInputs) { return }
    setNewConversationInputs(produce(newConversationInputs, (draft) => {
      Object.keys(draft).forEach((key) => {
        draft[key] = ''
      })
    }))
  }
  const [existConversationInputs, setExistConversationInputs] = useState<Record<string, any> | null>(null)
  const currInputs = isNewConversation ? newConversationInputs : existConversationInputs
  const setCurrInputs = isNewConversation ? setNewConversationInputs : setExistConversationInputs

  // info is muted
  const [newConversationInfo, setNewConversationInfo] = useState<ConversationInfoType | null>(null)
  const [existConversationInfo, setExistConversationInfo] = useState<ConversationInfoType | null>(null)
  const currConversationInfo = isNewConversation ? newConversationInfo : existConversationInfo

  return {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currInputs,
    newConversationInputs,
    existConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    currConversationInfo,
    setNewConversationInfo,
    setExistConversationInfo,
  }
}

export default useConversation
