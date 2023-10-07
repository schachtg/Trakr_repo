import React, { Fragment, useState, useEffect } from 'react';
import DividerWithText from '../../components/DividerWithText/DividerWithText';
import styles from './LoginPage.module.css';
import { SMALL_WIDTH } from '../../Constants';

// Components
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';

export default function LoginPage() {
    const [loginFormData, setLoginFormData] = useState({
        email: "",
        password: ""
    });
    const [createFormData, setCreateFormData] = useState({
        email: "",
        name: "",
        password: "",
        confirmPassword: ""
    });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [openDemoDialog, setOpenDemoDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    let smallScreen = windowWidth < (SMALL_WIDTH);

    const handleLoginOnChange = (e) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateOnChange = (e) => {
        setCreateFormData({
            ...createFormData,
            [e.target.name]: e.target.value
        });
    }

    const directToBoard = () => {
        window.location.assign("/board");
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                email: loginFormData.email,
                password: loginFormData.password
            };
            const response = await fetch("http://localhost:5000/user_info/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });

            if (response.status !== 200) {
                const output = await response.json();
                alert(output);
            } else {
                directToBoard();
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                email: createFormData.email,
                name: createFormData.name,
                password: createFormData.password
            };

            // Credentials hygeine
            if (body.email.includes("@") === false) {
                alert("Invalid email");
                return;
            }
            if (body.password.length < 5) {
                alert("Password must be at least 5 characters long");
                return;
            }

            const response = await fetch("http://localhost:5000/user_info/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (data === "User already exists") {
                alert("User already exists");
            } else {
                alert("Account created successfully!");
                setOpenCreateDialog(false);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleDemoSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                email: "PublicDemo",
                password: "123456"
            };
            const response = await fetch("http://localhost:5000/user_info/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });

            if (response.status !== 200) {
                const output = await response.json();
                alert(output);
            } else {
                directToBoard();
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        if (openCreateDialog) {
            if (createFormData.email.length > 0 &&
                createFormData.name.length > 0 &&
                createFormData.password.length > 0 &&
                createFormData.password === createFormData.confirmPassword) {
                setCanCreate(true);
            } else {
                setCanCreate(false);
            }
        }

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
                    <form id="loginForm" method="post" className={styles.col_style} onSubmit={handleLoginSubmit}>
                        <div className={styles.form_section}>
                            <label htmlFor="email">E-Mail:</label>
                            <input className={styles.input_line} type="text" id="email" name="email" value={loginFormData.email} onChange={handleLoginOnChange}/>
                        </div>
                        <div className={styles.form_section}>
                            <label htmlFor="password">Password:</label>
                            <input className={styles.input_line} type="password" id="password" name="password" value={loginFormData.password} onChange={handleLoginOnChange}/>
                            <p onClick={directToBoard} className={styles.forgot_password}>Forgot password?</p>
                        </div>
                        <div className={styles.form_section}>
                            <GButton givenWidth="100%" type="submit" form="loginForm">Login</GButton>
                        </div>
                    </form>
                    <DividerWithText className={styles.divider}>OR</DividerWithText>
                    <div className={smallScreen ? styles.bottom_col_container : styles.bottom_row_container}>
                        <div className={styles.col_style}>
                            <GButton alternate givenWidth="80%" type="button" onClick={() => setOpenCreateDialog(true)}>Create Account</GButton>
                        </div>
                        <div className={styles.col_style}>
                            <GButton alternate givenWidth="80%" type="button" onClick={() => setOpenDemoDialog(true)}>Use Public Demo</GButton>
                        </div>
                    </div>
                </div>
            </div>
            <GDialog
                title="Create Account"
                openDialog={openCreateDialog}
                setOpenDialog={setOpenCreateDialog}
                buttons={[
                    <GButton
                        type="button"
                        alternate
                        warning
                        onClick={() => setOpenCreateDialog(false)}
                    >
                        Back
                    </GButton>,
                    <GButton
                        type="submit"
                        disabled={!canCreate}
                        onClick={handleCreateSubmit}
                    >
                        Create
                    </GButton>
                ]}
            >
                <form id="createAccountForm" method="post" onSubmit={handleCreateSubmit}>
                    <div className={styles.col_style}>
                        <div className={styles.form_section}>
                            <label htmlFor="createEmail">E-Mail:</label>
                            <input className={styles.input_line} type="text" id="createEmail" name="email" value={createFormData.email} onChange={handleCreateOnChange}/>
                        </div>
                        <div className={styles.form_section}>
                            <label htmlFor="createName">Display Name:</label>
                            <input className={styles.input_line} type="text" id="createName" name="name" value={createFormData.name} onChange={handleCreateOnChange}/>
                        </div>
                        <div className={styles.form_section}>
                            <label htmlFor="createPassword">Password:</label>
                            <input className={styles.input_line} type="password" id="createPassword" name="password" value={createFormData.password} onChange={handleCreateOnChange}/>
                        </div>
                        <div className={styles.form_section}>
                            <label htmlFor="createConfirmPassword">Confirm Password:</label>
                            <input className={styles.input_line} type="password" id="createConfirmPassword" name="confirmPassword" value={createFormData.confirmPassword} onChange={handleCreateOnChange}/>
                        </div>
                    </div>
                </form>
            </GDialog>
            <GDialog
                title="Use Public Demo"
                openDialog={openDemoDialog}
                setOpenDialog={setOpenDemoDialog}
                buttons={[
                    <GButton
                        type="button"
                        alternate
                        warning
                        onClick={() => setOpenDemoDialog(false)}
                    >
                        Back
                    </GButton>,
                    <GButton
                        type="submit"
                        onClick={handleDemoSubmit}
                    >
                        Continue
                    </GButton>
                ]}
            >
                This feature allows you to try the application without the need to sign in. You will be
                able to anonymously interact with the project that is available to everyone. The purpose
                of this feature is for demoing purposes and is not to be used for actual projects. Please
                sign in if you want to create your own project.         
            </GDialog>
        </Fragment>
    );
}