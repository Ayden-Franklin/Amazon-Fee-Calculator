import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@src/store/hooks'
import Box from '@material-ui/core/Box'
import { fetchRuleContent } from '@src/store/fbaSlice'

function FBATable() {
  const dispatch = useAppDispatch()
  const pageContent = useAppSelector((state) => state.fba.content)
  const loadStatus = useAppSelector((state) => state.fba.status)
  const error = useAppSelector((state) => state.fba.error)
  const country = useAppSelector((state) => state.language)

  useEffect(() => {
    if (loadStatus === 'idle') {
      dispatch(fetchRuleContent(country.code))
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
export default FBATable
