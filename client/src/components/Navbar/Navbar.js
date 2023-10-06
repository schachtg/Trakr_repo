import React, { Fragment, useState, useEffect } from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import styles from './Navbar.module.css';
import { SMALL_WIDTH } from '../../Constants';
import { mdiAccount, mdiBell, mdiLogout } from '@mdi/js';

// Components
import GButton from '../GButton/GButton';
import GMenu from '../GMenu/GMenu';

export default function NavBar() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isPublicDemo, setIsPublicDemo] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    let screenSlack = 50;
    let smallScreen = windowWidth < (SMALL_WIDTH + screenSlack);

    const handleLogout = async () => {
        await fetch("http://localhost:5000/user_info/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        window.location.assign("/login");
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/user_info", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });

                const data = await response.json();
                setIsPublicDemo(data === "PublicDemo");

            } catch (error) {
                // Handle any network or fetch related errors here
                console.error("Fetch error:", error);
            }
        };
    
        fetchData(); // Call the async function

        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < (SMALL_WIDTH + screenSlack);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    function CustomLink({ to, children, ...props }) {
        const resolvedPath = useResolvedPath(to);
        const isActive = useMatch(resolvedPath.pathname);
    
        return (
            <li className={styles.li}>
                <Link className={`${styles.a} ${smallScreen ? styles.a_pad_sml : styles.a_pad_big} ${isActive ? styles.a_active : ""}`} to={to} {...props}>
                    {children}
                </Link>
            </li>
        );
    }

    return ( 
        <Fragment>
            <div className={styles.nav_outer}>
                {isPublicDemo && <div className={styles.public_demo_banner}>Public Demo</div>}
                <nav className={styles.nav}>
                    <div className={`${smallScreen ? "mr-3": "mr-5"} d-flex align-items-center`}>
                        <div className={styles.logo_container}>
                            <Link to="/board" className={`${styles.site_title_logo}`}>
                                T
                            </Link>
                        </div>
                        {!smallScreen && <Link to="/board" className={`${styles.site_title} ${styles.a}`}>
                            RAKR
                        </Link>}
                    </div>
                    <ul className={smallScreen ? styles.ul_sml : styles.ul_lrg}>
                        <CustomLink to="/board">Board</CustomLink>
                        <CustomLink to="/tickets">Tickets</CustomLink>
                        <CustomLink to="/history">History</CustomLink>
                        <CustomLink to="/projects">Projects</CustomLink>
                    </ul>
                    <ul className={`${smallScreen ? styles.ul_sml : styles.ul_lrg} ${styles.button_group}`}>
                        <GButton icon={mdiBell}></GButton>
                        <GButton
                            icon={mdiAccount}
                            onClick={() => setOpenProfile(!openProfile)}
                            menu={
                                <GMenu
                                    openMenu={openProfile}
                                    dropDownItems={[
                                        { icon: mdiLogout, text: "Logout", onClick: async () => await handleLogout()}
                                    ]}
                                >
                                    <h4>Email: </h4>
                                </GMenu>
                            }
                        />
                    </ul>
                </nav>
            </div>
        </Fragment>
    );
}