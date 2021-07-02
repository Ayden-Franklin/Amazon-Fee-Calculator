import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import { loadFBATable } from '@src/service/http';

function FBATable() {
  const [pageContent, setPageContent] = useState('loading');
  useEffect(() => {
    async function fetchData() {
      const response = await loadFBATable();
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
export default FBATable;
