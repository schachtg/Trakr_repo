import React, {Fragment, useState, useEffect } from 'react';
import styles from './GDialog.module.css';
import GButton from '../GButton/GButton';
import { mdiCloseCircle } from '@mdi/js';
import { SMALL_WIDTH } from '../../Constants';
import Divider from '@material-ui/core/Divider';

export default function GDialog({openDialog, setOpenDialog, children}) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < (SMALL_WIDTH);

    // Need to add background blur

    const onClickClose = () => {
        setOpenDialog(false);
    }

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

    return (openDialog) ? (
        <Fragment>
            <div className={styles.dialog_container}>
                <div className={`${styles.inner_dialog_container} ${smallScreen ? styles.inner_sml_padding : styles.inner_lrg_padding}`}>
                    <div className={styles.header_row}>
                        <h1 className={styles.long_text}>Really Really Really long Title</h1>
                        <GButton
                            icon={mdiCloseCircle}
                            transparent={true}
                            iconSize={1.7}
                            className={styles.close_btn}
                            onClick={onClickClose}
                        />
                    </div>
                    <Divider className={styles.divider_class}/>
                    {children}
                </div>
            </div>
        </Fragment>
    ) : "";
}