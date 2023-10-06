import React, {Fragment} from 'react';
import styles from './GButton.module.css';
import Icon from '@mdi/react';

export default function GButton({menu, children, icon, givenWidth="auto", iconSize=0.8, disabled=false, warning=false, alternate=false, transparent=false, type=null, ...props}) {
    let haveBoth = children && icon;
    let buttonStyle = null;

    if (warning) {
        if (transparent) {
            buttonStyle = styles.btn_trnsp;
        } else if (alternate) {
            buttonStyle = disabled ? styles.btn_secondary_warning_disabled : styles.btn_secondary_warning;
        } else {
            buttonStyle = disabled ? styles.btn_warning_disabled : styles.btn_warning;
        }
    } else {
        if (transparent) {
            buttonStyle = styles.btn_trnsp;
        } else if (alternate) {
            buttonStyle = disabled ? styles.btn_secondary_disabled : styles.btn_secondary;
        } else {
            buttonStyle = disabled ? styles.btn_disabled : styles.btn;
        }
    }

    return (
        <Fragment>
            <div className={styles.btn_container}>
                <button
                    onClick={props.onClick}
                    className={buttonStyle}
                    type={type}
                    disabled={disabled}
                    style={{ width: givenWidth }}
                >
                    {children && <span className={haveBoth ? styles.gap : ""}>{children}</span>}
                    {icon && <Icon path={icon} size={iconSize}></Icon>}
                </button>
                {menu}
            </div>
        </Fragment>
    );
}