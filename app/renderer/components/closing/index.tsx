import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { fetchRuleContent } from '@src/store/closingSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'

function ClosingFee() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.closing.content)
  const loadStatus = useAppSelector((state) => state.closing.status)
  const error = useAppSelector((state) => state.closing.error)

  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent())
    }
  }, [loadStatus, dispatch])
  return OriginalPage({ loadStatus, pageContent })
}
export default ClosingFee
