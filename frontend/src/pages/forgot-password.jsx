import { Helmet } from 'react-helmet-async';

import { ForgotPasswordView } from 'src/sections/forgot-password';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Reset Password | KERNEL </title>
      </Helmet>

      <ForgotPasswordView />
    </>
  );
}
