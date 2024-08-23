import { Helmet } from 'react-helmet-async';

import { CreateTransactionView } from 'src/sections/transaction';

// ----------------------------------------------------------------------

export default function CreateTransactionPage() {
  return (
    <>
      <Helmet>
        <title> Transaction | KERNEL </title>
      </Helmet>

      <CreateTransactionView />
    </>
  );
}
