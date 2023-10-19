import React, { Fragment, useEffect, useState } from 'react';
import styles from './ProjectsPage.module.css';
import RowItem from '../../components/RowItem/RowItem';
import GButton from '../../components/GButton/GButton';
import { mdiCrown, mdiPlus } from '@mdi/js';
import PermissionsTable from '../../components/PermissionsTable/PermissionsTable';
import ColumnOrder from '../../components/ColumnOrder/ColumnOrder';
import { MEDIUM_WIDTH } from '../../Constants';

export default function ProjectsPage() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < MEDIUM_WIDTH;

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < MEDIUM_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    return (
        <Fragment>
            <div className={styles.project_container} style={{ "padding": smallScreen ? "1rem" : "2rem" }}>
                <div className={styles.button_row}>
                    <h1 className={styles.project_header}>Project 1</h1>
                    <GButton
                        type="button"
                        noWrap
                    >
                        Open Project
                    </GButton>
                </div>
                <div className={styles.section_container} style={{ "width": "100%" }}>
                    <h1 className={styles.table__title}>Columns</h1>
                    <ColumnOrder />
                    <div className={styles.invite_btn_container}>
                        <GButton icon={mdiPlus}>Add Column</GButton>
                    </div>
                </div>
                <div className={styles.project_row} style={{ "flexDirection": smallScreen ? "column" : "row" }}>
                    <div className={styles.section_container} style={{ "width": smallScreen ? "100%" : "50%" }}>
                        <h1 className={styles.table__title}>Users</h1>
                        <RowItem
                            title="Graham Schacht"
                            subtitle="Admin"
                            prependIcon={mdiCrown}
                            childRows={[
                                {
                                    title: "Change Role",
                                },
                                {
                                    title: "Remove User",
                                },
                            ]}
                        />
                        <RowItem
                            title="Person A"
                            subtitle="Perm Level 1"
                            childRows={[
                                {
                                    title: "Change Role",
                                },
                                {
                                    title: "Remove User",
                                },
                            ]}
                        />
                        <RowItem
                            title="Person 2"
                            childRows={[
                                {
                                    title: "Change Role",
                                },
                                {
                                    title: "Remove User",
                                },
                            ]}
                        />
                        <div className={styles.invite_btn_container}>
                            <GButton icon={mdiPlus}>Invite User</GButton>
                        </div>
                    </div>
                    <div className={styles.section_container} style={{ "width": smallScreen ? "100%" : "50%" }}>
                        <h1 className={styles.table__title}>Permissions</h1>
                        <PermissionsTable />
                        <div className={styles.invite_btn_container}>
                            <GButton icon={mdiPlus}>Create Role</GButton>
                        </div>
                    </div>
                </div>
                <div className={styles.button_row}>
                    <GButton
                        type="button"
                        warning
                    >
                        Delete Project
                    </GButton>
                </div>
            </div>
        </Fragment>
    );
}