import Cookies from "universal-cookie";
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';


// ----------------------------------------------------------------------
export default function CreateContributionView() {
  const theme = useTheme();

  const router = useRouter();
  const cookies = new Cookies()

  const [debit, setDebit] = useState(0.00);
  const [date, setDate] = useState(null);
  const [fund, setFund] = useState(null);
  const [funds, setFunds] = useState([]);
  const [debitInvalid, setDebitInvalid] = useState(false);
  const [accountInvalid, setAccountInvalid] = useState(false);

  const handleInitialResponse = (data) => {
    setFunds(data.funds);
  }
  /* eslint-disable */
  useEffect (() => {

    fetch("http://"+window.location.hostname+":5000/savings/contribute", {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleInitialResponse(data));
  }, [])

  const handleResponse = (data) => {
    router.push('/savings');
  }

  const handleAccountChange = (e) => {
    setFund(e.target.value);
  }

  

  const validateForm = () => {
    var regexString = /^\d*(\.\d{0,2})?$/;
    const debitString = debit+"";
    if (!(debit === 0.00 || debit < 0.00 || !regexString.test(debitString)) && date !== null && fund !== null ) { // eslint-disable-line no-use-before-define
      return true;
    }

    if (debit === 0.00 || debit < 0.00 || !regexString.test(debitString)) { 
      setDebitInvalid(true);
    } else {
      setDebitInvalid(false);
    }
    if (fund == null) {
      setAccountInvalid(true);
    } else {
      setAccountInvalid(false);
    }
    return false;
    
  }
  
  const handleClick = () => {
    if (validateForm()) {
      fetch("http://"+window.location.hostname+":5000/savings/contribute", {
        method:'POST',
        mode:'cors',
        headers: {
          'Content-Type':'application/json',
        'auth':cookies.get('jwt_auth')},
        body: JSON.stringify({
          'debit':debit,
          'date':date,
          'fund_id':fund,
        })
      }).then(response => response.json())
      .then(data => handleResponse(data));
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
      <TextField 
        error={debitInvalid} 
        required 
        name="debit" 
        type="number"
        label="Total" 
        onInput={e => setDebit(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}/>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Date" value={date} onChange={(n_date) => setDate(n_date)}/>
        </LocalizationProvider>

          <Select
            required
            error={accountInvalid}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            displayEmpty
            renderValue={fund !== null ? undefined : () => "Fund"}
            label="Fund"
            onChange={handleAccountChange}
          >
            {
              funds.map((acc) => (
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
        Contribute
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
          <Typography variant="h4">Add New Contribution</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}/>
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
