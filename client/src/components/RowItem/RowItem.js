import React, {Fragment, useState, useEffect} from 'react';
import styles from './RowItem.module.css';
import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import { SMALL_WIDTH } from '../../Constants';

export default function RowItem({title, subtitle, icon, iconSize=0.8, childRows=[], onClick, ...props}) {
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
    });

    return (
        <Fragment>
            <div className={styles.row_container}>
                <div className={styles.row_item} onClick={handleClickRow}>
                    <div className={styles.title_container} style={{gap: smallScreen ? "1rem" : "2rem"}}>
                        <h1 className={styles.row_item_title}>{title}</h1>
                        <h1 className={styles.row_item_subtitle}>{subtitle}</h1>
                    </div>
                    <div className={styles.icon_container}>
                        {icon && <Icon path={icon} size={iconSize}></Icon>}
                        {childRows.length > 0 && <Icon style={{ transform: openRow ? "rotate(180deg)" : "rotate(0deg)" }} path={mdiChevronDown} size={iconSize}></Icon>}
                    </div>
                </div>
                {openRow && <div className={styles.row_children}>
                    {childRows.map((row, index) => {
                        return (
                            <RowItem
                                key={index}
                                title={row.title}
                                subtitle={row.subtitle}
                                icon={row.icon}
                                iconSize={row.iconSize}
                                childRows={row.childRows}
                            />
                        );
                    })}
                </div>}
            </div>
        </Fragment>
    );
}