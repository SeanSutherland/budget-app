import { Helmet } from 'react-helmet-async';

import { EditTransactionView } from 'src/sections/edit-transaction';

// ----------------------------------------------------------------------

export default function EditTransactionPage() {
  return (
    <>
      <Helmet>
        <title> Transaction | KERNEL </title>
      </Helmet>

      <EditTransactionView />
    </>
  );
}
