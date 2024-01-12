import React, { Fragment, useState, useEffect, useContext } from 'react';
import styles from './OTPInputPage.module.css';
import { RecoveryContext } from '../LoginPageWrapper/LoginPageWrapper';
import { baseURL } from '../../apis/TicketManager';

// Components
import GButton from '../../components/GButton/GButton';

export default function OTPInputPage() {
    const { setPage, email, otp, setOTP, setResetToken } = useContext(RecoveryContext);
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(60);
    const [disable, setDisable] = useState(true);

    const handleSubmit = (event) => {
        event.preventDefault();
        if(code === String(otp)) {
            setPage("reset");
        } else {
            alert("Incorrect code");
        }
    }

    const handleOnChange = (e) => {
        setCode(e.target.value);
    };

    const resendCode = async () => {
        if (disable) return;

        const newOTP = Math.floor(Math.random() * 900000 + 100000);
        setOTP(newOTP);
        const body = {
            recipient_email: email,
            otp: newOTP
        }

        try {
            const data = await fetch(`${baseURL}/forgot_password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            const output = await data.json();
            setResetToken(output.resetToken);
            setDisable(true);
            alert(`A new code has been sent to your email ${email}`);
            setTimer(60);
        } catch (err) {
            console.error(err.message);
        }
        return;
    }

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer((lastTimerCount) => {
                lastTimerCount <= 1 && clearInterval(interval);
                if (lastTimerCount <= 1) {
                    setDisable(false);
                }
                if (lastTimerCount <= 0) {
                    return lastTimerCount;
                }
                return lastTimerCount - 1;
            });
        }, 1000); // Each count lasts for a second
        return () => {
            clearInterval(interval);
        }
    }, [disable]);

    return (
        <Fragment>
            <div className={styles.outter_container}>
                <div className={styles.inner_container}>
                    <h1 className="text-center">Email Verification</h1>
                    <p className="text-center">A code has been sent to your email {email}</p>
                    <form className={styles.form_class} id="otpForm" method="post" onSubmit={handleSubmit}>
                        <div className={styles.col_style}>
                            <div className={styles.form_section}>
                                <label htmlFor="enterOTP">Verification code:</label>
                                <input className={styles.input_line} type="text" id="enterOTP" name="enterOTP" value={code} onChange={handleOnChange}/>
                            </div>
                            <GButton centered type="submit">Verify Account</GButton>
                        </div>
                    </form>
                    <div className="flex-row text-center">
                        <span>Didn't recieve a code? </span>
                        <span
                            onClick={resendCode}
                            className={styles.resend_otp}
                        >
                            {disable ? `Resend code in ${timer}s` : "Resend code"}
                        </span>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}