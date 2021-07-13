import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import Box from '@material-ui/core/Box'
import { fetchRuleContent } from '@src/store/referralSlice'

function ReferralTable() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.referral.content)
  const loadStatus = useAppSelector((state) => state.referral.status)
  const error = useAppSelector((state) => state.referral.error)

  useEffect(() => {
    if (loadStatus === 'idle') {
      dispatch(fetchRuleContent())
    }
  }, [loadStatus, dispatch])

  let content

  if (loadStatus === 'loading') {
    content = <div className="loader">Loading...</div>
  } else if (loadStatus === 'succeeded') {
    content = <div dangerouslySetInnerHTML={{ __html: pageContent }} />
  } else if (loadStatus === 'failed') {
    content = <div>{error}</div>
  }
  return <Box m={2}>{content}</Box>
}
export default ReferralTable
