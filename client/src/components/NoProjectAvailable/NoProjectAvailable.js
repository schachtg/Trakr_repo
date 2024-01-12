import React, {Fragment, useState, useEffect} from 'react';
import styles from './NoProjectAvailable.module.css';
import ImageNoProject from '../../assets/NoProjectAvailable.svg';
import GButton from '../GButton/GButton';
import { mdiChevronRight } from '@mdi/js';

export default function NoProjectAvailable() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const SMALL_WIDTH = 700;

    const handleClickProjectPage = () => {
        window.location.href = "/projects";
    }

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    return (
        <Fragment>
            <div className={styles.no_tickets_container}>
                {windowWidth > SMALL_WIDTH && <div className={styles.no_tickets_container}>
                    <img src={ImageNoProject} className={styles.img_lrg} alt="No projects available"/>
                    <h1 className={styles.no_tickets_text_lrg}>No project opened yet</h1>
                </div>}
                {windowWidth <= SMALL_WIDTH && <div className={styles.no_tickets_container}>
                    <img src={ImageNoProject} className={styles.img_sml} alt="No projects available"/>
                    <h1 className={styles.no_tickets_text_sml}>No project opened yet</h1>
                </div>}
                <div className={styles.no_project_button}>
                    <GButton
                        type="button"
                        icon={mdiChevronRight}
                        onClick={handleClickProjectPage}
                    >
                        Go to Projects
                    </GButton>
                </div>
            </div>
        </Fragment>
    );
}