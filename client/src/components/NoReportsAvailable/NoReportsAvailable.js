import React, {Fragment, useState, useEffect} from 'react';
import styles from './NoReportsAvailable.module.css';
import Image from '../../assets/NoReportsAvailable.svg';

export default function NoReportsAvailable() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const SMALL_WIDTH = 700;
    let smallScreen = windowWidth < SMALL_WIDTH;

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < SMALL_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    return (
        <Fragment>
            <div className={styles.icon_container}>
                <img src={Image} className={smallScreen ? styles.img_sml : styles.img_lrg} alt="No reports available"/>
                <h1 className={smallScreen ? styles.text_sml : styles.text_lrg}>Reports are still in development</h1>
            </div>
        </Fragment>
    );
}