import React, {Fragment, useState, useEffect} from 'react';
import styles from './RowItem.module.css';
import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import { SMALL_WIDTH } from '../../Constants';

export default function RowItem({title, subtitle, prependIcon, appendIcon, iconSize=0.8, childRows=[], onClick, disabled, strikethrough=false, ...props}) {
    const [openRow, setOpenRow] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < (SMALL_WIDTH);

    const handleClickRow = () => {
        onClick && onClick();
        childRows.length > 0 && setOpenRow(!openRow);
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

    return (
        <Fragment>
            <div className={styles.row_container}>
                <div className={disabled ? styles.row_item_disabled : styles.row_item} onClick={handleClickRow} path={mdiChevronDown} size={iconSize}>
                    <div className={styles.title_container} style={{gap: smallScreen ? "1rem" : "2rem"}}>
                        {prependIcon && <div className={styles.prepend_container}>
                            <Icon path={prependIcon} size={iconSize}></Icon>
                        </div>}
                        <h1 className={strikethrough ? styles.row_item_title_crossed : styles.row_item_title}>{title}</h1>
                        <h1 className={styles.row_item_subtitle}>{subtitle}</h1>
                    </div>
                    <div className={styles.append_container}>
                        {appendIcon && <Icon path={appendIcon} size={iconSize}></Icon>}
                        {childRows.length > 0 && <Icon style={{ transform: openRow ? "rotate(180deg)" : "rotate(0deg)" }} path={mdiChevronDown} size={iconSize}></Icon>}
                    </div>
                </div>
                {openRow && <div className={styles.row_children}>
                    {childRows.map((row, index) => {
                        return (
                            <RowItem
                                key={index}
                                onClick={row.onClick}
                                title={row.title}
                                subtitle={row.subtitle}
                                appendIcon={row.appendIcon}
                                iconSize={row.iconSize}
                                childRows={row.childRows}
                                disabled={row.disabled}
                            />
                        );
                    })}
                </div>}
            </div>
        </Fragment>
    );
}