import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableToolbar({ applyFilters, users, categories, numSelected, filterName, onFilterName, onDelete, onMonthChange }) {

  const [filtersOpen, setFiltersOpen] = useState(false);
  
  
  const [month, setMonth] = useState(0);

  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const [usersSelected, setUsersSelected] = useState([]);
  const [essentialsSelected, setEssentialsSelected] = useState([]);
  const [typesSelected, setTypesSelected] = useState([]);

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    const new_cats = typeof value === 'string' ? value.split(',') : value;
    setCategoriesSelected(new_cats);
    applyFilters(new_cats, usersSelected, typesSelected, essentialsSelected);
  };

  const handleUserChange = (event) => {
    const {
      target: { value },
    } = event;
    const new_users = typeof value === 'string' ? value.split(',') : value;
    setUsersSelected(new_users);
    applyFilters(categoriesSelected, new_users, typesSelected, essentialsSelected);
  };

  const handleTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    const new_types = typeof value === 'string' ? value.split(',') : value;
    setTypesSelected(new_types);
    applyFilters(categoriesSelected, usersSelected, new_types, essentialsSelected);
  };

  const handleEssentialChange = (event) => {
    const {
      target: { value },
    } = event;
    const new_essentials = typeof value === 'string' ? value.split(',') : value;
    setEssentialsSelected(new_essentials);
    applyFilters(categoriesSelected, usersSelected, typesSelected, new_essentials);
  };

  const handleReset = () => {
    setCategoriesSelected([]);
    setUsersSelected([]);
    setTypesSelected([]);
    setEssentialsSelected([]);
    applyFilters([], [],[],[]);
  }

  const handlePreviousMonth = () => {
    const temp_month = month +1
    setMonth(temp_month);
    onMonthChange(temp_month);
  }

  const handleNextMonth = () => {
    const temp_month = month -1
    setMonth(temp_month);
    onMonthChange(temp_month);
  }

  /* eslint-disable */
  return (
    <>
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search transactions..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDelete}>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
    <Collapse in={filtersOpen}>
    <Grid container padding={2} paddingLeft={{xs:2, sm:5}} paddingRight={{xs:2, sm:5}} spacing={3} justifyContent="space-between">
        <Button variant="contained" onClick={handlePreviousMonth} color="grey" startIcon={<Iconify icon="eva:minus-fill" />}>
          Previous Month
        </Button>
        <Button  variant="contained" disabled={month === 0} onClick={handleNextMonth} color="grey" startIcon={<Iconify icon="eva:plus-fill" />}>
          Next Month
        </Button>
      </Grid>
      <Grid container spacing={3}></Grid>
    <Stack container padding={2} 
      spacing={1}
      direction='row'
      justifyContent="left"
      useFlexGap 
      flexWrap="wrap"
      alignItems="left">
    <Grid xs={12} sm={6} md={3}>
    <FormControl sx={{ m: 1, width: 200 }}>
        <InputLabel id="demo-multiple-name-label">Category</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          multiple
          value={categoriesSelected}
          onChange={handleCategoryChange}
          input={<OutlinedInput label="Category" />}
        >
          {categories.map((cat) => (
            <MenuItem
              key={cat.id}
              value={cat.name}
              
            >
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    <Grid xs={12} sm={6} md={3}>
    <FormControl sx={{ m: 1, width: 200 }}>
        <InputLabel id="demo-multiple-name-label">User</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          multiple
          value={usersSelected}
          onChange={handleUserChange}
          input={<OutlinedInput label="User" />}
        >
          {users.map((cat) => (
            <MenuItem
              key={cat.id}
              value={cat.name}
              
            >
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    <Grid xs={12} sm={6} md={3}>
    <FormControl sx={{ m: 1, width: 200 }}>
        <InputLabel id="demo-multiple-name-label">Essential</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          multiple
          value={essentialsSelected}
          onChange={handleEssentialChange}
          input={<OutlinedInput label="Essential" />}
        >
            <MenuItem
              key="Essential"
              value={true}
              
            >
              Essential
            </MenuItem>
            <MenuItem
              key="Non-Essential"
              value={false}
              
            >
              Non-Essential
            </MenuItem>
         
        </Select>
      </FormControl>
    </Grid>
    <Grid xs={12} sm={6} md={3}>
    <FormControl sx={{ m: 1, width: 200 }}>
        <InputLabel id="demo-multiple-name-label">Type</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          multiple
          value={typesSelected}
          onChange={handleTypeChange}
          input={<OutlinedInput label="Type" />}
        >
            <MenuItem
              key="Expense"
              value={false}
              
            >
              Expense
            </MenuItem>
            <MenuItem
              key="Income"
              value={true}
              
            >
              Income
            </MenuItem>
         
        </Select>
      </FormControl>
    </Grid>
    <Grid xs={12} sm={6} md={3} alignContent='center'>
    <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={(e) => {handleReset()}}
      >
        Clear
      </LoadingButton>
    </Grid>
    </Stack>
    </Collapse>
    
    </>
  );
}

UserTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onDelete: PropTypes.func,
  categories: PropTypes.any,
  users: PropTypes.any,
  applyFilters: PropTypes.func,
  onMonthChange: PropTypes.func
};
