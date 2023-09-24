import React, {Fragment, useState, useEffect} from 'react';
import styles from './NoTicketsAvailable.module.css';
import ImageNoTickets from '../../assets/No_Tickets_Available.png';
import { SMALL_WIDTH } from '../../Constants';

export default function NoTicketsAvailable() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
    });
    return (
        <Fragment>
            <div className={styles.no_tickets_container}>
                <img src={ImageNoTickets} className={smallScreen ? styles.img_sml : styles.img_lrg} alt="No tickets available"/>
                <h1 className={smallScreen ? styles.no_tickets_text_sml : styles.no_tickets_text_lrg}>No tickets made yet</h1>
            </div>
        </Fragment>
    );
}