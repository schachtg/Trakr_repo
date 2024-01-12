import React, { Fragment, useState, useEffect, useContext } from 'react';
import styles from './PasswordResetPage.module.css';
import { SMALL_WIDTH } from '../../Constants';
import { RecoveryContext } from '../LoginPageWrapper/LoginPageWrapper';
import { baseURL } from '../../apis/TicketManager';

// Components
import GButton from '../../components/GButton/GButton';

export default function PasswordResetPage() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [disabled, setDisabled] = useState(false);
    const [resetFormData, setResetFormData] = useState({
        newPassword: "",
        confirmNewPassword: ""
    });
    const { setPage, email, resetToken } = useContext(RecoveryContext);
    let smallScreen = windowWidth < (SMALL_WIDTH);

    const handleChangePassword = async (event) => {
        event.preventDefault();
        if(resetFormData.newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
        } else if (resetFormData.newPassword !== resetFormData.confirmNewPassword) {
            alert("Passwords do not match.");
        } else {
            const body = {
                recipient_email: email,
                password: resetFormData.newPassword,
                token: resetToken
            }
    
            try {
                const data = await fetch(`${baseURL}/reset_password`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body)
                });
    
                const output = await data.json();
                alert(output);
            } catch (err) {
                console.error(err.message);
            }
            setPage('login');
            return;
        }
    }

    const handleOnChange = (e) => {
        setResetFormData({
            ...resetFormData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < (SMALL_WIDTH);
        if(resetFormData.newPassword !== resetFormData.confirmNewPassword) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [resetFormData]);

    return (
        <Fragment>
            <div className={styles.outter_container}>
                <div className={styles.inner_container}>
                    <h1 className={`text-center ${smallScreen ? "mb-2" : "my-4"}`}>Change Password</h1>
                    <form id="resetPasswordForm" method="post" onSubmit={handleChangePassword}>
                        <div className={styles.col_style}>
                            <div className={styles.form_section}>
                                <label htmlFor="newPassword">New password:</label>
                                <input className={styles.input_line} type="password" id="newPassword" name="newPassword" value={resetFormData.newPassword} onChange={handleOnChange}/>
                            </div>
                            <div className={styles.form_section}>
                                <label htmlFor="confirmNewPassword">Confirm new password:</label>
                                <input className={styles.input_line} type="password" id="confirmNewPassword" name="confirmNewPassword" value={resetFormData.confirmNewPassword} onChange={handleOnChange}/>
                            </div>
                            <GButton centered type="submit" disabled={disabled}>Change Password</GButton>
                        </div>
                    </form>
                </div>
            </div>
        </Fragment>
    );
}