export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator(a, b, orderBy) {
  if (a[orderBy] === null) {
    return 1;
  }
  if (b[orderBy] === null) {
    return -1;
  }
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function applyFilter({ inputData, comparator, filterName,filterCat,filterUser, filterType, filterEssential }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterCat.length !== 0) {
    inputData = inputData.filter(
      (user) => filterCat.some((cat) => (cat === "Uncategorized") ? user.category.toLowerCase() === "" : cat.toLowerCase() === user.category.toLowerCase())
    );
  }

  if (filterUser.length !== 0) {
    inputData = inputData.filter(
      (user) => filterUser.some((cat) => cat.toLowerCase() === user.user.toLowerCase())
    );
  }

  if (filterType.length !== 0) {
    inputData = inputData.filter(
      (user) => filterType.some((cat) => cat === user.income)
    );
  }

  if (filterEssential.length !== 0) {
    inputData = inputData.filter(
      (user) => filterEssential.some((cat) => cat === user.essential)
    );
  }

  return inputData;
}
