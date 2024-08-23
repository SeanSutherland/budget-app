import { Helmet } from 'react-helmet-async';

import { SplitsView } from 'src/sections/splits/view';

// ----------------------------------------------------------------------

export default function SplitsPage() {
  return (
    <>
      <Helmet>
        <title> Splits | KERNEL </title>
      </Helmet>

      <SplitsView />
    </>
  );
}
