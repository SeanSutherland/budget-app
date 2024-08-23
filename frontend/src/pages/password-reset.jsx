import { Helmet } from 'react-helmet-async';

import { PasswordResetView } from 'src/sections/password-reset';

// ----------------------------------------------------------------------

export default function PasswordResetPage() {
  return (
    <>
      <Helmet>
        <title> Reset Password | KERNEL </title>
      </Helmet>

      <PasswordResetView />
    </>
  );
}
