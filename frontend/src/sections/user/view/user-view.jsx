import Cookies from "universal-cookie";
import { useState,useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------
/* eslint-disable */
export default function UserPage() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('');

  const [filterName, setFilterName] = useState('');
  const [filterCat, setFilterCat] = useState([]);
  const [filterUser, setFilterUser] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [filterEssential, setFilterEssential] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const router = useRouter();

  const handleResponse = (data) => {
    setTransactions(data.transactions);
    setCategories(data.categories)
    setUsers(data.users);
  }
  
  const cookies = new Cookies()

  useEffect (() => {
    const cookies = new Cookies()

    fetch("http://"+window.location.hostname+":5000/transactions", {
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

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = transactions.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFiltersApplied = (cat_filters, user_filters, type_filters, essential_filters) => {
    setPage(0);
    setFilterCat(cat_filters);
    setFilterUser(user_filters);
    setFilterType(type_filters);
    setFilterEssential(essential_filters);
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: transactions,
    comparator: getComparator(order, orderBy),
    filterName,
    filterCat,
    filterUser,
    filterType,
    filterEssential
  });

  const handleDeleteResponse = (n_selected) => {
    const new_transactions = [];
    for (var i = 0; i < transactions.length;i++) {
      if (!n_selected.includes(transactions[i].id)) {
        new_transactions.push(transactions[i])
      } 
    }
    setTransactions(new_transactions);
    setSelected([]);
  }

  const deleteSelected = (event) => {
    fetch("http://"+window.location.hostname+":5000/transaction/delete-group", {
      method:'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')},
      body: JSON.stringify({
        'transactions': selected,
      })
    }).then(response => response.json())
    .then(data => handleDeleteResponse(selected));
  };

  const handleDeleteTransaction = (event, id) => {
    fetch("http://"+window.location.hostname+":5000/transaction/delete", {
      method:'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')},
      body: JSON.stringify({
        'id': id,
      })
    }).then(response => response.json())
    .then(data => handleDeleteResponse([id]));
  }

  const handleEditTransaction = (event, id) => {
    router.push('/transaction/edit/'+id);
  }

  const handleMonthChange = (month) => {
    const cookies = new Cookies();
    //router.push('/budget/'+value);
    fetch("http://"+window.location.hostname+":5000/transactions"+"?"+ new URLSearchParams({
      month: month,
    }), {
      method:'GET',
      mode:'cors',
      headers: {
        'Content-Type':'application/json',
      'auth':cookies.get('jwt_auth')}
    }).then(response => response.json())
    .then(data => handleResponse(data));
  }

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Transactions</Typography>

        <Button variant="contained" onClick={() => {router.push('/transactions/create');}}color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          New Transaction
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onDelete={deleteSelected}
          onFilterName={handleFilterByName}
          categories={categories}
          users={users}
          applyFilters={(a,b,c,d) => handleFiltersApplied(a,b,c,d)}
          onMonthChange={(m) => handleMonthChange(m)}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'date', label: 'Date' },
                  { id: 'category', label: 'Category' },
                  { id: 'account', label: 'User' },
                  { id: 'debit', label: 'Debit' },
                  { id: '' },
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
                      income={row.income}
                      avatarUrl={row.name}
                      selected={selected.indexOf(row.id) !== -1}
                      handleClick={(event) => handleClick(event, row.id)}
                      handleEditTransaction={(event) => handleEditTransaction(event,row.id)}
                      handleDeleteTransaction={(event) => handleDeleteTransaction(event,row.id)}
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
