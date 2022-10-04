import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { fetchRuleContent } from '@src/store/assetSlice'
import { StateStatus } from '@src/renderer/constants'
import Content from './content'
function RuleTypePage(props: { type: string }) {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.asset.content[props.type])
  const loadStatus = useAppSelector((state) => state.asset.status)
  const error = useAppSelector((state) => state.asset.error)
  useEffect(() => {
    if (loadStatus === StateStatus.Idle) {
      dispatch(fetchRuleContent())
    }
  }, [loadStatus, dispatch])
  return <Content loadStatus={loadStatus} pageContent={pageContent} error={error} />
}
export default RuleTypePage
