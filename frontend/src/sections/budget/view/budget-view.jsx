import Cookies from "universal-cookie";
import {useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fPercent,fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppConversionRates from '../app-conversion-rates';

// ----------------------------------------------------------------------
/* eslint-disable */
export default function BudgetView() {

  const { id } = useParams();

  const router = useRouter();
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [highlights, setHighlights] = useState({});
  const [dailyTransactions, setDailyTransactions] = useState({});
  const [essentialSpending, setEssentialSpending] = useState([]);
  const [category, setCategory] = useState(0);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(0);
  const [monthName, setMonthName] = useState("");
  const [users, setUsers] = useState([]);
  const [userSpend, setUserSpend] = useState([]);

  const handleResponse = (data) => {
    setRecentTransactions(data.recent_transactions);
    setAllCategories(data.spend_by_name);
    setHighlights(data.highlights);
    setDailyTransactions(data.daily_transactions);
    setEssentialSpending(data.essential_spending);
    setCategories(data.categories);
    setCategory(data.category_id);
    setMonthName(data.month_name);
    setUsers(data.users);
    setUserSpend(data.user_spend);
  }
  /* eslint-disable */
  useEffect (() => {
    const cookies = new Cookies()

    fetch("http://"+window.location.hostname+":5000/budget/"+id, {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleResponse(data));
  },[])

  const changeCategory = (value) => {
    setCategory(value);
    const cookies = new Cookies();
    router.push('/budget/'+value);
    fetch("http://"+window.location.hostname+":5000/budget/"+value+"?"+ new URLSearchParams({
      month: month,
      users: getSelectedUsers(),
    }), {
      method:'GET',
      mode:'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')}
    }).then(response => response.json())
    .then(data => handleResponse(data));
  }

  const previousMonth = () => {
    const cookies = new Cookies();
    setMonth(month+1);
    //router.push('/budget/'+value);
    fetch("http://"+window.location.hostname+":5000/budget/"+category+"?"+ new URLSearchParams({
      month: month+1,
      users: getSelectedUsers(),
    }), {
      method:'GET',
      mode:'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')}
    }).then(response => response.json())
    .then(data => handleResponse(data));
  }

  const getSelectedUsers = () => {
    var selected_users = ""
    for (var i = 0 ; i < users.length ; i++) {
      if (users[i].selected) {
        selected_users = selected_users + "1";
      } else {
        selected_users = selected_users + "0";
      }
    }
    return selected_users;
  }

  const handleUserClick = (value) => {
    const cookies = new Cookies();
    var selected_users = ""
    for (var i = 0 ; i < users.length ; i++) {
      if (i === value) {
        if (users[i].selected) {
          selected_users = selected_users + "0";
        } else {
          selected_users = selected_users + "1";
        }
      } else {
        if (users[i].selected) {
          selected_users = selected_users + "1";
        } else {
          selected_users = selected_users + "0";
        }
      }
    }
    //router.push('/budget/'+value);
    fetch("http://"+window.location.hostname+":5000/budget/"+category+"?"+ new URLSearchParams({
      month: month,
      users: selected_users,
    }), {
      method:'GET',
      mode:'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')}
    }).then(response => response.json())
    .then(data => handleResponse(data));
  }

  const nextMonth = () => {
    const cookies = new Cookies();
    setMonth(month-1);
    //router.push('/budget/'+value);
    fetch("http://"+window.location.hostname+":5000/budget/"+category+"?"+ new URLSearchParams({
      month: month-1,
      users: getSelectedUsers(),
    }), {
      method:'GET',
      mode:'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')}
    }).then(response => response.json())
    .then(data => handleResponse(data));
  }

  return (
    <Container maxWidth="xl">
      <Stack sx={{maxWidth: 250}} spacing={3}  >
        <Typography variant="h4" sx={{ mb: 5 }}>
          Budget for: {monthName}
        </Typography>
        <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              displayEmpty
              renderValue={category !== null ? undefined : () => id}
              label="Category"
              value={category}
              onChange={(e) => {changeCategory(e.target.value)}}
            >
              {
                categories.map((cat) => (
                  <MenuItem value={cat.id}>{cat.name}</MenuItem>
                ))
              }
        </Select>
      </Stack>
      <Stack direction="row" padding={2} sx={{maxWidth: 500}} spacing={3}>
      {
        users.map((row,index) => (
          <Button
            variant="contained"
            color={row.selected ? 'primary' : 'grey'}
            startIcon={<Avatar src={'/assets/images/avatars/'+row.id+'.jpg'} />}
            onClick={() => handleUserClick(index)}
            >
            {row.name}
        </Button>
        ))
      }
      </Stack>
      
      <Grid container padding={3} spacing={3} justifyContent="space-between">
        <Button variant="contained" onClick={previousMonth} color="inherit" startIcon={<Iconify icon="eva:minus-fill" />}>
          Previous Month
        </Button>
        <Button disabled={(month === 0)} variant="contained" onClick={nextMonth} color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          Next Month
        </Button>
      </Grid>
      <Grid container spacing={3}>
        
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Month Spend"
            total={fCurrency(highlights.total_spend)}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Month Budget"
            total={fCurrency(highlights.monthly_budget)}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Budget Utilisation"
            total={fPercent(highlights.utilisation)}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Budget Balance"
            total={fCurrency(highlights.total_contribution)}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title="Spend by Category"
            subheader=""
            chart={{
              series: allCategories,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Essential spending"
            chart={{
              series: essentialSpending,
            }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Daily Transactions"
            subheader=""
            chart={{
              labels: dailyTransactions.labels,
              series: [
                {
                  name: 'This Month',
                  type: 'area',
                  fill: 'gradient',
                  data: dailyTransactions.this_month,
                },
                {
                  name: 'Last Month',
                  type: 'area',
                  fill: 'gradient',
                  data: dailyTransactions.last_month,
                },
              ],
            }}
          />
        </Grid>
        
        <Grid xs={12} md={6} lg={4}>
          <AppOrderTimeline
            title="Recent Transactions"
            list={recentTransactions}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Spend by User"
            chart={{
              series: userSpend,
            }}
          />
        </Grid>
       
      </Grid>
    </Container>
  );
}
