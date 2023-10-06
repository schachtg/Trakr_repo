import React, {Fragment } from 'react';
import Icon from '@mdi/react';
import styles from './GMenu.module.css';

function DropdownItem(props) {
    const iconSize = 0.8; 
    return(
        <Fragment>
            <Icon path={props.icon} size={iconSize}></Icon>
            <span>{props.text}</span>
        </Fragment>
    );
}

export default function GMenu({openMenu, dropDownItems, children}) {
    return (openMenu) ? (
        <Fragment>
            <div className={styles.dropdown_menu}>
                {children}
                <ul>
                    {dropDownItems.map((item, index) => {
                        return (
                            <li key={index} onClick={item.onClick}>
                                <DropdownItem
                                    icon={item.icon}
                                    text={item.text}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Fragment>
    ) : "";
}