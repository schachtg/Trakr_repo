import React, { Fragment, createContext, useState } from 'react';
import LoginPage from '../LoginPage/LoginPage';
import OTPInputPage from '../OTPInputPage/OTPInputPage';
import PasswordResetPage from '../PasswordResetPage/PasswordResetPage';

export const RecoveryContext = createContext();
export default function LoginPageWrapper() {
    const [page, setPage] = useState("login");
    const [email, setEmail] = useState("");
    const [otp, setOTP] = useState("");
    const [resetToken, setResetToken] = useState();
  
    function NavigateLoginPages() {
      if (page === "login") return <LoginPage />;
      if (page === "otp") return <OTPInputPage />;
      if (page === "reset") return <PasswordResetPage />;
      return <LoginPage />;
    }

    return (
        <Fragment>
            <RecoveryContext.Provider value={{page, setPage, email, setEmail, otp, setOTP, resetToken, setResetToken}}>
                <NavigateLoginPages />
            </RecoveryContext.Provider>
        </Fragment>
    );
}