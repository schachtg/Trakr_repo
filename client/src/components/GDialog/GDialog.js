import React, {Fragment, useState, useEffect } from 'react';
import styles from './GDialog.module.css';
import GButton from '../GButton/GButton';
import { mdiCloseCircle } from '@mdi/js';
import { SMALL_WIDTH } from '../../Constants';
import Divider from '@material-ui/core/Divider';

export default function GDialog({title, openDialog, setOpenDialog, buttons=[], fitContent, children}) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < (SMALL_WIDTH);

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
    }, []);

    return (openDialog) ? (
        <Fragment>
            <div className={styles.dialog_container}>
                <div style={{ maxWidth: fitContent ? "fit-content" : "800px" }} className={`${styles.inner_dialog_container} ${smallScreen ? styles.inner_sml_padding : styles.inner_lrg_padding}`}>
                    <div className={styles.header_row}>
                        <h1 className={styles.long_text}>{title}</h1>
                        <GButton
                            icon={mdiCloseCircle}
                            transparent
                            iconSize={1.7}
                            className={styles.close_btn}
                            onClick={onClickClose}
                            type="button"
                        />
                    </div>
                    <Divider className={styles.divider_class}/>
                    {children}
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