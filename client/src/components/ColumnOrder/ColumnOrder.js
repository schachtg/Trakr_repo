import React, {Fragment} from 'react';
import styles from './ColumnOrder.module.css';
import { mdiChevronLeft, mdiChevronRight, mdiDelete } from '@mdi/js';

// Components
import GButton from '../GButton/GButton';

function ColumnBox(props) {
    const iconSize = 1.1; 

    return(
        <Fragment>
            <div className={styles.column_box}>
                <div className={styles.input_row}>
                    <span>Name:</span>
                    <input className={styles.max_input} type="text" />
                </div>
                <div className={styles.input_row}>
                    <span>Max:</span>
                    <input className={styles.max_input} type="text" />
                </div>
                <div className={styles.btn_row}>
                    <div className={styles.grouped_btn}>
                        <GButton icon={mdiChevronLeft} iconSize={iconSize} transparent />
                        <GButton icon={mdiChevronRight} iconSize={iconSize} transparent />
                    </div>
                    <GButton icon={mdiDelete} iconSize={iconSize} warning transparent />
                </div>
            </div>
        </Fragment>
    );
}

export default function ColumnOrder() {
    return (
        <Fragment>
            <div className={styles.scroll_container}>
                <div className={styles.columns_container}>
                    <div className={styles.outer_container}>
                        <ColumnBox title="Impeded" />
                        <ColumnBox title="To Do" />
                        <ColumnBox title="In Progress" />
                        <ColumnBox title="Testing" />
                        <ColumnBox title="Done" />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}