import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import { fetchRuleContent } from '@src/store/rulesSlice'
import { StateStatus } from '@src/service/constants'
import OriginalPage from '@src/renderer/components/originalPage'
function RulesPage(props: { pageName: string }) {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.rules.content[props.pageName])
  const loadStatus = useAppSelector((state) => state.rules.status)
  const error = useAppSelector((state) => state.rules.error)
  useEffect(() => {
    if (loadStatus === StateStatus.Idel) {
      dispatch(fetchRuleContent())
    }
  }, [loadStatus, dispatch])
  return OriginalPage({ loadStatus, pageContent, error })
}
export default RulesPage
