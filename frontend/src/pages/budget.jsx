import { Helmet } from 'react-helmet-async';

import { BudgetView } from 'src/sections/budget/view';

// ----------------------------------------------------------------------

export default function BudgetPage() {
  return (
    <>
      <Helmet>
        <title> Budgets | KERNEL </title>
      </Helmet>

      <BudgetView />
    </>
  );
}
