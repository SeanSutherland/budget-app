import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { fCurrency } from 'src/utils/format-number';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------
/* eslint-disable */
export default function AppConversionRates({ title, subheader, chart, ...other }) {
  const { colors, series, options } = chart;

  const chartSeriesSpend = series.map((i) => i.spend);
  const categories = series.map((i) => i.label);

  const chartOptions = useChart({
    colors,
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
          var spend = chartSeriesSpend[dataPointIndex];
          var cat = categories[dataPointIndex];
          
          return '<div><b>Vendor</b>: ' + cat  +
          '<br><b>Spend</b>: ' + fCurrency(spend)  + '</div>';
        },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '28%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: series.map((i) => i.label),
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
          series={[{data:chartSeriesSpend}]}
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
