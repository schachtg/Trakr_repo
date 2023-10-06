import React, {Fragment } from 'react';
import Icon from '@mdi/react';
import styles from './GMenu.module.css';

function SelectableItem(props) {
    const iconSize = 0.8; 
    return(
        <Fragment>
            <Icon path={props.icon} size={iconSize}></Icon>
            <span>{props.text}</span>
        </Fragment>
    );
}

export default function GMenu({openMenu, textItems=[], selectableItems=[], children}) {
    return (openMenu) ? (
        <Fragment>
            <div className={styles.dropdown_menu_before} />
            <div className={styles.dropdown_menu}>
                {children}
                {textItems.map((item, index) => {
                    return (
                        <div className={item.segmented ? styles.segmented : ""} key={index}>
                            {item.title && <h1 className={styles.item_title}>{item.title}</h1>}
                            {item.text && <p className={item.noWrap ? styles.item_text_no_wrap : styles.item_text}>{item.text}</p>}
                        </div>
                    );
                })}
                <ul>
                    {selectableItems.map((item, index) => {
                        return (
                            <li key={index} onClick={item.onClick}>
                                <SelectableItem
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