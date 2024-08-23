import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import AppOrderTimeline from './app-order-timeline';


// ----------------------------------------------------------------------

export default function PostCard({ fund }) {

  const renderTitle = (
    <Typography
      color="inherit"
      variant="h4"
      underline="hover"
      sx={{
        overflow: 'wrap',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        
      }}
    >
      {fund.name}
    </Typography>
  );
  /* eslint-disable */
  const renderTotal = (
    <Typography
      color="inherit"
      variant="subtitle1"
      underline="hover"
      sx={{
        overflow: 'wrap',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        
      }}
    >
      {fCurrency(fund.balance)} / {fCurrency(fund.goal)} <br/>
      {
        fund.month_contributions !== 0 && 
        "(+" + fCurrency(fund.month_contributions) + " this month)"
      }
    </Typography>
  );

  
  return (
    <Grid xs={12} sm={6} md={4}>
      <Card>
        <Box padding={2}
        >
          <Box display='flex' size="100%" justifyContent='center' alignItems='center'>
            <Box sx={{ position: 'relative' }}>
            <CircularProgress 
            size="15rem" 
            variant="determinate" 
            value={100}
            sx={{
              position: 'absolute',
              color: "rgb(237,239,241)"
            }}/>
            <CircularProgress 
            size="15rem" 
            variant="determinate" 
            value={fund.percent}
            sx={{
              position: 'absolute',
              color: "rgb(127,186,0)"
            }}/>
            <CircularProgress 
            color='warning'
            size="15rem" 
            variant="determinate" 
            value={fund.percent - (100*fund.month_contributions/fund.goal)}/>
            
            </Box>
            <Typography variant="h3" position='absolute'>{fCurrency(fund.balance)}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: (theme) => theme.spacing(4, 3, 3, 3),
            
          }}
        >

        {renderTitle}
        {renderTotal}

        {fund.contributions.length!==0 &&
          <AppOrderTimeline
            title="Recent Contributions"
            list={fund.contributions}
          />

        }
        </Box>
      </Card>
    </Grid>
  );
}

PostCard.propTypes = {
  fund: PropTypes.object.isRequired,
};
