import Cookies from "universal-cookie";
import {useState,useEffect} from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

import PostCard from '../post-card';

// ----------------------------------------------------------------------


export default function BlogView() {

  const [funds, setFunds] = useState([]);
  const router = useRouter();

  const handleResponse = (data) => {
    setFunds(data.funds);
  }
  /* eslint-disable */
  useEffect (() => {
    const cookies = new Cookies()

    fetch("http://"+window.location.hostname+":5000/funds", {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleResponse(data));
  },[])


  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Savings</Typography>

        <Button variant="contained" onClick={(e) => {router.push('/savings/contribute')}} color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          New Contribution
        </Button>
      </Stack>

      <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between"/>

      <Grid container spacing={3}>
        {funds.map((fund) => (
          <PostCard key={fund.id} fund={fund} />
        ))}
      </Grid>
    </Container>
  );
}
