import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import { loadClosingFee } from '@src/service/http';

function ClosingFee() {
  const [pageContent, setPageContent] = useState('loading');
  useEffect(() => {
    async function fetchData() {
      const response = await loadClosingFee();
      console.log('load successfully');
      setPageContent(response);
    }
    fetchData();
  }, []);
  return (
    <Box m={2}>
      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    </Box>
  );
}
export default ClosingFee;
