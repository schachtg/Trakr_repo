import React, { Fragment, useState, useEffect } from 'react';
import DividerWithText from '../../components/DividerWithText/DividerWithText';
import styles from './LoginPage.module.css';
import { SMALL_WIDTH } from '../../Constants';

// Components
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [openDialog, setOpenDialog] = useState(false);
    let smallScreen = windowWidth < (SMALL_WIDTH);

    const handleOnChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const directToBoard = () => {
        window.location.assign("/board");
    };

    const handleUsePublic = () => {
        setOpenDialog(true);
    };

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < (SMALL_WIDTH);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    return (
        <Fragment>
            <div className={styles.outter_container}>
                <div className={styles.inner_container}>
                    <h1 className={`text-center ${smallScreen ? "mb-2" : "my-4"}`}>Login</h1>
                    <form id="loginForm" method="post" className={styles.col_style}>
                        <div className={styles.form_section}>
                            <label htmlFor="email">E-Mail:</label>
                            <input className={styles.input_line} type="text" id="email" name="email" value={formData.email} onChange={handleOnChange}/>
                        </div>
                        <div className={styles.form_section}>
                            <label htmlFor="password">Password:</label>
                            <input className={styles.input_line} type="text" id="password" name="password" value={formData.password} onChange={handleOnChange}/>
                            <p onClick={directToBoard} className={styles.forgot_password}>Forgot password?</p>
                        </div>
                        <div className={styles.form_section}>
                            <GButton givenWidth="100%" type="submit" form="loginForm">Login</GButton>
                        </div>
                    </form>
                    <DividerWithText className={styles.divider}>OR</DividerWithText>
                    <div className={smallScreen ? styles.bottom_col_container : styles.bottom_row_container}>
                        <div className={styles.col_style}>
                            <GButton givenWidth="80%" type="button">Create Account</GButton>
                        </div>
                        <div className={styles.col_style}>
                            <GButton givenWidth="80%" type="button" onClick={handleUsePublic}>Use Public Demo</GButton>
                        </div>
                    </div>
                </div>
            </div>
            <GDialog title="Use Public Demo" openDialog={openDialog} setOpenDialog={setOpenDialog}>
                This feature allows you to try the application without the need to sign in. You will be
                able to anonymously interact with the project that is available to everyone. The purpose
                of this feature is for demoing purposes and is not to be used for actual projects. Please
                sign in if you want to create your own project.
                <div className={styles.button_row}>
                    <GButton
                        type="button"
                        warning
                        onClick={() => setOpenDialog(false)}
                    >
                        Back
                    </GButton>
                    <GButton
                        onClick={directToBoard}
                        type="button"
                    >
                        Continue
                    </GButton>
                </div>
            </GDialog>
        </Fragment>
    );
}