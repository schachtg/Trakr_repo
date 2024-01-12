import React, {Fragment, useState, useEffect } from 'react';
import styles from './DangerDialog.module.css';
import { SMALL_WIDTH } from '../../Constants';

export default function DangerDialog({title, openDialog, buttons=[], children}) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < (SMALL_WIDTH);

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < (SMALL_WIDTH);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (openDialog) ? (
        <Fragment>
            <div className={styles.dialog_container}>
                <div className={`${styles.inner_dialog_container} ${smallScreen ? styles.inner_sml_padding : styles.inner_lrg_padding}`}>
                    <div className={styles.header_row}>
                        <h1 className={styles.long_text}>{title}</h1>
                    </div>
                    <div className={styles.children_container}>
                        {children}
                    </div>
                    {buttons.length > 0 && <div className={styles.button_row}>
                        {buttons.map((button, index) => {
                            return (
                                <div className={styles.button_container} key={index}>
                                    {button}
                                </div>
                            )
                        })}
                    </div>}
                </div>
            </div>
        </Fragment>
    ) : "";
}