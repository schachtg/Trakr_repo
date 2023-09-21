import React, { Fragment, useState, useEffect } from 'react';
import styles from './SprintTable.module.css';
import { SMALL_WIDTH } from '../../Constants';

export default function SprintTable() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let colMax = [true, false, false, false, false]
    let numRows = 10;
    let smallScreen = windowWidth < SMALL_WIDTH;

    const divs = Array.from({ length: numRows }, (_, index) => (
        <div key={index} className={styles.sprint_box} />
    ));

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
            <div className={styles.sprint_row}>
                <div className={styles.sprint_col_impeded}>
                    <div className={colMax[0] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>Impeded</h1>
                        {divs}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                    <div className={colMax[1] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>To Do</h1>
                        {divs}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                <div className={colMax[2] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>In Progress</h1>
                        {divs}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                <div className={colMax[3] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>Testing</h1>
                        {divs}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                <div className={colMax[4] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>Done</h1>
                        {divs}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}