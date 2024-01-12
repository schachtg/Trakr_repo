import React, { Fragment } from 'react';
import NoReportsAvailable from '../../components/NoReportsAvailable/NoReportsAvailable';
import styles from './ReportsPage.module.css';

export default function ReportsPage() {
    return (
        <Fragment>
            <div className={styles.page_container}>
                <NoReportsAvailable />
            </div>
        </Fragment>
    );
}