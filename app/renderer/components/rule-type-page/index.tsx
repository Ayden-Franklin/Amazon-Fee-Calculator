import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { fetchRuleContent } from '@src/store/rulesSlice'
import { StateStatus } from '@src/renderer/constants'
import Content from './content'
function RuleTypePage(props: { type: string }) {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.rules.content[props.type])
  const loadStatus = useAppSelector((state) => state.rules.status)
  const error = useAppSelector((state) => state.rules.error)
  useEffect(() => {
    if (loadStatus === StateStatus.Idle) {
      dispatch(fetchRuleContent())
    }
  }, [loadStatus, dispatch])
  return <Content loadStatus={loadStatus} pageContent={pageContent} error={error} />
}
export default RuleTypePage
