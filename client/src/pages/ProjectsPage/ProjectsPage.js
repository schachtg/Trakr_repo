import React, { Fragment, useEffect, useState } from 'react';
import styles from './ProjectsPage.module.css';
import RowItem from '../../components/RowItem/RowItem';
import GButton from '../../components/GButton/GButton';
import { mdiCrown, mdiPlus } from '@mdi/js';
import PermissionsTable from '../../components/PermissionsTable/PermissionsTable';
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
            <h1 className="text-center mt-5">Projects Page</h1>
            <div className={styles.project_container} style={{ "flexDirection": smallScreen ? "column" : "row" }}>
                <div className={styles.section_container} style={{ "width": smallScreen ? "100%" : "50%" }}>
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
                        title="Person 1"
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
                    <PermissionsTable />
                </div>
            </div>
        </Fragment>
    );
}