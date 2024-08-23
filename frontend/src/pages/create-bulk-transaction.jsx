import { Helmet } from 'react-helmet-async';

import { CreateBulkTransactionView } from 'src/sections/transaction-bulk';

// ----------------------------------------------------------------------

export default function CreateBulkTransactionPage() {
  return (
    <>
      <Helmet>
        <title> Transaction | KERNEL </title>
      </Helmet>

      <CreateBulkTransactionView />
    </>
  );
}
