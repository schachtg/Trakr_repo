import React, {Fragment} from 'react';
import styles from './GButton.module.css';
import Icon from '@mdi/react';

export default function GButton({children, icon, givenWidth="auto", iconSize=0.8, warning=false, transparent=false, type=null, ...props}) {
    let haveBoth = children && icon;
    let buttonStyle = warning ? styles.btn_warning : styles.btn;
    buttonStyle = transparent ? styles.btn_trnsp : buttonStyle;

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