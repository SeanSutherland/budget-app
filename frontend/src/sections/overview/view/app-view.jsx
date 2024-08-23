import Cookies from "universal-cookie";
import {useState,useEffect} from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { fPercent,fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppTrafficBySite from '../app-traffic-by-site';
import AppConversionRates from '../app-conversion-rates';

// ----------------------------------------------------------------------
/* eslint-disable */
export default function AppView() {
  
  const [recentTransactions, setRecentTransactions] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [highlights, setHighlights] = useState({})
  const [dailyTransactions, setDailyTransactions] = useState({})
  const [essentialSpending, setEssentialSpending] = useState([])
  const [funds, setFunds] = useState([])

  const handleResponse = (data) => {
    setRecentTransactions(data.recent_transactions);
    setTopCategories(data.pie_chart);
    setAllCategories(data.spend_by_category);
    setHighlights(data.highlights);
    setDailyTransactions(data.daily_transactions);
    setEssentialSpending(data.essential_spending);
    setFunds(data.funds);
  }

  useEffect (() => {
    const cookies = new Cookies()

    fetch("http://"+window.location.hostname+":5000/dashboard", {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleResponse(data));
  },[])

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

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
            title="Total Month Income"
            total={fCurrency(highlights.total_income)}
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
            title="Total Month Contributions"
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
            title="Category Distribution"
            chart={{
              series: topCategories,
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
          <AppCurrentVisits
            title="Essential spending"
            chart={{
              series: essentialSpending,
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
          <AppTrafficBySite
            title="Savings Funds"
            list={funds.map((fund) => (
              {
                id: fund.id,
                name: fund.name,
                value: fund.balance,
                percent: fund.percent,
                icon: <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={32} />,
              }
            ))}
          />
        </Grid>


      </Grid>
    </Container>
  );
}
