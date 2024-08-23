import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { fNumber, fPercent,fCurrency } from 'src/utils/format-number';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------
/* eslint-disable */
export default function AppConversionRates({ title, subheader, chart, ...other }) {
  const { colors, series, options } = chart;

  const chartSeries = series.map((i) => i.value);
  const chartSeriesSpend = series.map((i) => i.spend);
  const categories = series.map((i) => i.label);
  const budgets = series.map((i) => i.budget);

  const chartOptions = useChart({
    colors,
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
          var value = chartSeries[dataPointIndex];
          var spend = chartSeriesSpend[dataPointIndex];
          var cat = categories[dataPointIndex];
          var budget = budgets[dataPointIndex];
          
          return '<div><b>Category</b>: ' + cat  +
          '<br><b>Spend</b>: ' + fCurrency(spend)  +
          '<br><b>Budget</b>: ' + fCurrency(budget)  +
          '<br><b>Utilisation</b>: ' + fPercent(value) + '</div>';
        },
    },
    goals:[
      {
        name: "",
        value:100,
        strokeColor: '#000000'
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: '65%',
        barWidth: '65%',
        borderRadius: 1,
      },
    },
    xaxis: {
      categories: series.map((i) => i.label),
    },
    yaxis:[
      {
        title:{
          text: "Percent",
        },
        tickAmount: 10,
        formatter: (value) => fCurrency(value),
        decimalsInFloat: 0,
      },
      {
        opposite: true,
        title:{
          text: "Total Spend",
        },
        formatter: (value) => fNumber(value),
        decimalsInFloat: 0,
      },
    ],
    subtitle: {
      categories: series.map((i) => i.spend),
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ mx: 3 }}>
        <Chart
          dir="ltr"
          type="bar"
          series={[{ name:"Percent", data: chartSeries },{ name: "Total", data: chartSeriesSpend }]}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}

AppConversionRates.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
