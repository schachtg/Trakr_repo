import React, { useState, useEffect } from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import styles from './Navbar.module.css';
import { SMALL_WIDTH } from '../../Constants';
import { mdiAccount, mdiBell } from '@mdi/js';

// Components
import GButton from '../GButton/GButton';

export default function NavBar() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let screenSlack = 50;
    let smallScreen = windowWidth < (SMALL_WIDTH + screenSlack);


    useEffect(() => {
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

    return <nav className={styles.nav}>
        <div className={`${smallScreen ? "mr-3": "mr-5"} d-flex align-items-center`}>
            <div className={styles.logo_container}>
                <Link to="/" className={`${styles.site_title_logo}`}>
                    T
                </Link>
            </div>
            {!smallScreen && <Link to="/" className={`${styles.site_title} ${styles.a}`}>
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
            <GButton icon={mdiAccount}></GButton>
        </ul>
    </nav>
}