import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';


// ----------------------------------------------------------------------

export default function UserTableRow({
  id,
  name,
  avatarUrl,
  date, 
  category,
  user,
  debit,
  owed,
  paid,
  handlePay,
}) {

  

  return (
      <TableRow hover tabIndex={-1} role="checkbox" >

        <TableCell component="th" scope="row" padding="1">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap color={paid ? '#DDDDDD':''}>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell >
          <Typography variant="body" color={paid ? '#DDDDDD':''}>
            {date}
          </Typography>
        </TableCell>
        <TableCell >
          <Typography variant="body" color={paid ? '#DDDDDD':''}>
            {category}
          </Typography>
        </TableCell>
        <TableCell >
          <Typography variant="body" color={paid ? '#DDDDDD':''}>
            {user}
          </Typography>
        </TableCell>

        <TableCell style={{color: owed ? "red":"green"}}>{debit}</TableCell>
        <TableCell>
          <Button disabled={!(owed && !paid)} variant="contained" color="inherit" onClick={(event) => handlePay(id)}>
            Pay
          </Button>
        </TableCell>

      </TableRow>

  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  name: PropTypes.any,
  date: PropTypes.any,
  category: PropTypes.string,
  user: PropTypes.string,
  debit: PropTypes.any,
  owed: PropTypes.bool,
  paid: PropTypes.bool,
  id: PropTypes.any,
  handlePay: PropTypes.func,
};
