import Cookies from "universal-cookie";
import { useState,useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import AppWidgetSummary from '../app-widget-summary';
import { emptyRows, applyFilter, getComparator } from '../utils';



// ----------------------------------------------------------------------
/* eslint-disable */
export default function SplitsView() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  const handleResponse = (data) => {
    setTransactions(data.transactions);
    setBalance(data.balance);
  }
  
  const cookies = new Cookies()

  useEffect (() => {
    const cookies = new Cookies()

    fetch("http://"+window.location.hostname+":5000/splits", {
    method:'GET',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')}
  }).then(response => response.json())
  .then(data => handleResponse(data));
  },[])

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handlePay = (id) => {
    console.log("Paid " + id)
    fetch("http://"+window.location.hostname+":5000/splits", {
    method:'POST',
    mode:'cors',
    headers: {
      'Content-Type':'application/json',
    'auth':cookies.get('jwt_auth')},
    body: JSON.stringify({
      'id': id,
    })
  }).then(response => response.json())
  .then(data => handleResponse(data));
  }

  const dataFiltered = applyFilter({
    inputData: transactions,
    comparator: getComparator(order, orderBy)
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Splits</Typography>

      </Stack>
      <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Balance Owing"
            total={fCurrency(balance)}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

      <Card>
        

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleSort}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'date', label: 'Date' },
                  { id: 'category', label: 'Category' },
                  { id: 'account', label: 'User' },
                  { id: 'debit', label: 'Debit' },
                  { id: 'pay', label: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      id={row.id}
                      date={fDate(row.date)}
                      category={row.category}
                      user={row.user}
                      debit={fCurrency(row.debit)}
                      name={row.name}
                      owed={row.owed}
                      avatarUrl={row.name}
                      paid={row.paid}
                      handlePay={handlePay}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
