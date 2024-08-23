import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PieChartIcon from '@mui/icons-material/PieChart';

import SvgColor from 'src/components/svg-color';


// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'transactions',
    path: '/transactions',
    icon: <ReceiptIcon sx={{ width: 1, height: 1 }}/>,
  },
  {
    title: 'budget',
    path: '/budget/1',
    icon: <PieChartIcon sx={{ width: 1, height: 1 }}/>,
  },
  {
    title: 'Savings',
    path: '/savings',
    icon: <SavingsIcon sx={{ width: 1, height: 1 }}/>,
  },
  {
    title: 'Splits',
    path: '/splits',
    icon: <PeopleIcon sx={{ width: 1, height: 1 }}/>,
  },
  {
    title: 'Logout',
    path: '/login',
    icon: <LogoutIcon sx={{ width: 1, height: 1 }}/>,
  },
];

export default navConfig;
