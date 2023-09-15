import React, {Fragment} from 'react';
import styles from './GButton.module.css';
import Icon from '@mdi/react';

export default function GButton({children, icon, iconSize=0.8, transparent=false, type=null, ...props}) {
    let haveBoth = children && icon;

    return (
        <Fragment>
            <button
                onClick={props.onClick}
                className={transparent ? styles.btn_trnsp : styles.btn}
                type={type}
            >
                {children && <span className={haveBoth ? styles.gap : ""}>{children}</span>}
                {icon && <Icon path={icon} size={iconSize}></Icon>}
            </button>
        </Fragment>
    );
}