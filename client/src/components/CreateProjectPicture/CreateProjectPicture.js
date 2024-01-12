import React, {Fragment, useState, useEffect} from 'react';
import styles from './CreateProjectPicture.module.css';
import ImageNoProjects from '../../assets/CreateProjectPicture.svg';

export default function CreateProjectPicture() {
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
                <img src={ImageNoProjects} className={smallScreen ? styles.img_sml : styles.img_lrg} alt="No projects available"/>
                <h1 className={smallScreen ? styles.no_projects_text_sml : styles.no_projects_text_lrg}>No projects made yet</h1>
            </div>
        </Fragment>
    );
}