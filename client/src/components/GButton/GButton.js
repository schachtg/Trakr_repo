import React, {Fragment} from 'react';
import styles from './GButton.module.css';
import Icon from '@mdi/react';

export default function GButton({children, icon, givenWidth="auto", iconSize=0.8, warning=false, alternate=false, transparent=false, type=null, ...props}) {
    let haveBoth = children && icon;
    let buttonStyle = null;

    if (warning) {
        if (transparent) {
            buttonStyle = styles.btn_trnsp;
        } else if (alternate) {
            buttonStyle = styles.btn_secondary_warning;
        } else {
            buttonStyle = styles.btn_warning;
        }
    } else {
        if (transparent) {
            buttonStyle = styles.btn_trnsp;
        } else if (alternate) {
            buttonStyle = styles.btn_secondary;
        } else {
            buttonStyle = styles.btn;
        }
    }

    return (
        <Fragment>
            <button
                onClick={props.onClick}
                className={buttonStyle}
                type={type}
                style={{ width: givenWidth }}
            >
                {children && <span className={haveBoth ? styles.gap : ""}>{children}</span>}
                {icon && <Icon path={icon} size={iconSize}></Icon>}
            </button>
        </Fragment>
    );
}