import Cookies from "universal-cookie";
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';


// ----------------------------------------------------------------------
export default function CreateTransactionView() {
  const theme = useTheme();

  const router = useRouter();
  const cookies = new Cookies()

  const [name, setName] = useState("");
  const [debit, setDebit] = useState(0.00);
  const [date, setDate] = useState(null);
  const [income, setIncome] = useState(false);
  const [essential, setEssential] = useState(false);
  const [category, setCategory] = useState(null);
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [debitInvalid, setDebitInvalid] = useState(false);
  const [accountInvalid, setAccountInvalid] = useState(false);
  
  const [otherAccount, setOtherAccount] = useState(null);
  const [joint, setJoint] = useState(false);
  const [otherUserAccounts, setOtherUserAccounts] = useState([]);

  const handleInitialResponse = (data) => {
    setAccounts(data.accounts);
    setCategories(data.categories);
    setOtherUserAccounts(data.other_accounts);
  }
  /* eslint-disable */
  useEffect (() => {

    fetch("http://"+window.location.hostname+":5000/transaction/create", {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleInitialResponse(data));
  }, [])

  const handleResponse = (data) => {
    router.push('/transactions');
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  }

  const handleAccountChange = (e) => {
    setAccount(e.target.value);
  }

  const handleOtherAccountChange = (e) => {
    setOtherAccount(e.target.value);
  }

  const validateForm = () => {
    var regexString = /^\d*(\.\d{0,2})?$/;
    const debitString = debit+"";
    if (name !== "" && !(debit === 0.00 || debit < 0.00 || !regexString.test(debitString)) && date !== null && account !== null ) { // eslint-disable-line no-use-before-define
      return true;
    }
    if (name === "") {
      setNameInvalid(true);
    } else {
      setNameInvalid(false);
    }

    if (debit === 0.00 || debit < 0.00 || !regexString.test(debitString)) { 
      setDebitInvalid(true);
    } else {
      setDebitInvalid(false);
    }
    if (account == null) {
      setAccountInvalid(true);
    } else {
      setAccountInvalid(false);
    }
    return false;
    
  }
  
  const handleClick = () => {
    if (validateForm()) {
      fetch("http://"+window.location.hostname+":5000/transaction/create", {
        method:'POST',
        mode:'cors',
        headers: {
          'Content-Type':'application/json',
        'auth':cookies.get('jwt_auth')},
        body: JSON.stringify({
          'name': name,
          'debit':debit,
          'date':date,
          'income':income,
          'category_id':category,
          'account_id':account,
          'essential':essential,
          'joint':joint,
          'other_account':otherAccount,
        })
      }).then(response => response.json())
      .then(data => handleResponse(data));
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
      <TextField error={nameInvalid} required name="name" label="Title" onInput={e => setName(e.target.value)}/>
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
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            displayEmpty
            renderValue={category !== null ? undefined : () => "Category"}
            label="Category"
            onChange={handleCategoryChange}
          >
            {
              categories.map((cat) => (
                <MenuItem value={cat.id}>{cat.name}</MenuItem>
              ))
            }
          </Select>

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

        <FormControlLabel control={<Checkbox name="income" label="Income" onInput={e => setIncome(e.target.checked)}/>} label="Income" />
        <FormControlLabel control={<Checkbox name="essential" label="Essential" onInput={e => setEssential(e.target.checked)}/>} label="Essential" />
        <FormControlLabel control={<Checkbox name="joint" label="Joint" onInput={e => setJoint(e.target.checked)}/>} label="Joint" />
        
        {joint && <Select
            required
            error={accountInvalid}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            displayEmpty
            renderValue={otherAccount !== null ? undefined : () => "Account"}
            label="Account"
            onChange={handleOtherAccountChange}
          >
            {
              otherUserAccounts.map((acc) => (
                <MenuItem value={acc.id}>{acc.name}</MenuItem>
              ))
            }
          </Select>
}
        
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
            Want to upload a transaction csv file?
            <Link variant="subtitle2" sx={{ ml: 0.5 }} href="/transactions/create-bulk">
              Upload one here. 
            </Link>
          </Typography>
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
