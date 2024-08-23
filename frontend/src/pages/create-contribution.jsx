import { Helmet } from 'react-helmet-async';

import { CreateContributionView } from 'src/sections/contribution';

// ----------------------------------------------------------------------

export default function CreateContributionPage() {
  return (
    <>
      <Helmet>
        <title> Contribution | KERNEL </title>
      </Helmet>

      <CreateContributionView />
    </>
  );
}
