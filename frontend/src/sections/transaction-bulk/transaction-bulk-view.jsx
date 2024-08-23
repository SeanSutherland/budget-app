import Cookies from "universal-cookie";
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Button from "@mui/material/Button";
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';


// ----------------------------------------------------------------------
export default function CreateBulkTransactionView() {
  const theme = useTheme();

  const router = useRouter();

  const [account, setAccount] = useState(null);
  const [file, setFile] = useState();
  const [accounts, setAccounts] = useState([]);
  const [accountInvalid, setAccountInvalid] = useState(false);

  const handleInitialResponse = (data) => {
    setAccounts(data.accounts);
  }
  /* eslint-disable */
  useEffect (() => {
    const cookies = new Cookies();
    fetch("http://"+window.location.hostname+":5000/transaction/create", {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleInitialResponse(data));
  }, [])
  
  const cookies = new Cookies();

  const handleResponse = (data) => {
    router.push('/transactions');
  }

  const handleAccountChange = (e) => {
    setAccount(e.target.value);
  }

  

  const validateForm = () => {
    if (account == null) {
      setAccountInvalid(true);
      return false;
    } 
    setAccountInvalid(false);
    return true;
  }
  
  /* eslint-disable */
  const handleClick = () => {
    if (validateForm()) {
      const data = new FormData();
      data.append("file",file);

      fetch("http://"+window.location.hostname+":5000/transaction/bulk-create/"+ account, {
        method:'POST',
        mode:'cors',
        body: data,
        headers: {
        'auth':cookies.get('jwt_auth')},
      }).then(response => response.json())
      .then(r_data => handleResponse(r_data));
    } 
  };

  const handleFileUpload = (e) => {
    const u_file = e.target.files[0];
    setFile(u_file);
  }

  const renderForm = (
    <>
      <Stack spacing={3}>
        <Button variant="contained" component="label">
          Upload
          <input hidden name="file" accept="*.csv" type="file" onChange={handleFileUpload} />
        </Button>
          <Select
            required
            error={accountInvalid}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            displayEmpty
            renderValue={account !== null ? undefined : () => "Account"}
            label="Account"
            onChange={handleAccountChange}
          >
            {
              accounts.map((acc) => (
                <MenuItem value={acc.id}>{acc.name}</MenuItem>
              ))
            }
          </Select>

      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}/>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleClick}
      >
        Add
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Add New Transaction</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Notes: 
            <ul>
            <li>File must be of .csv format.</li>
            <li>This does not check for duplicate transactions.</li>
            <li>Only BMO MasterCard exports are currently supported. </li>
              </ul>
          </Typography>
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
