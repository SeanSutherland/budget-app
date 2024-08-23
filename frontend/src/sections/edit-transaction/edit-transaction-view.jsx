import dayjs from 'dayjs';
import Cookies from "universal-cookie";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
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
export default function EditTransactionView() {
  const theme = useTheme();

  const { id } = useParams();

  const router = useRouter();
  /* eslint-disable */
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
    if (data.code === 401) {
      router.push('/transactions');
    }
    setAccounts(data.accounts);
    setCategories(data.categories);
    setOtherUserAccounts(data.other_accounts);

    const transactionDetails = data.transaction;

    setName(transactionDetails.name);
    setDebit(transactionDetails.debit);
    setDate(dayjs(transactionDetails.date));
    setIncome(transactionDetails.income);
    setEssential(transactionDetails.essential);
    setCategory(transactionDetails.category_id);
    setAccount(transactionDetails.account_id);
  }

  const handleOtherAccountChange = (e) => {
    setOtherAccount(e.target.value);
  }

  useEffect (() => {
    const cookies = new Cookies();
    
    fetch("http://"+window.location.hostname+":5000/transaction/edit/"+id, {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleInitialResponse(data));
  },[])

  const cookies = new Cookies()
  const handleResponse = (data) => {
    router.push('/transactions');
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  }

  const handleAccountChange = (e) => {
    setAccount(e.target.value);
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
      fetch("http://"+window.location.hostname+":5000/transaction/edit", {
        method:'POST',
        mode:'cors',
        headers: {
          'Content-Type':'application/json',
        'auth':cookies.get('jwt_auth')},
        body: JSON.stringify({
          'id': id,
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
      <TextField error={nameInvalid} required name="name" label="Title" value={name} onChange={e => setName(e.target.value)}/>
      <TextField 
        error={debitInvalid} 
        required 
        name="debit" 
        type="number"
        label="Total" 
        value={debit}
        onChange={e => setDebit(e.target.value)}
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
            value={category}
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
            value={account}
            onChange={handleAccountChange}
          >
            {
              accounts.map((acc) => (
                <MenuItem value={acc.id}>{acc.name}</MenuItem>
              ))
            }
          </Select>

        <FormControlLabel control={<Checkbox name="income" label="Income" checked={income} onChange={e => setIncome(e.target.checked)}/>} label="Income" />
        <FormControlLabel control={<Checkbox name="essential" label="Essential" checked={essential} onChange={e => setEssential(e.target.checked)}/>} label="Essential" />
        <FormControlLabel control={<Checkbox name="joint" label="Split Transaction" onInput={e => setJoint(e.target.checked)}/>} label="Split Transaction" />
        
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
        Update
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
          <Typography variant="h4">Edit Transaction</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}/>
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
