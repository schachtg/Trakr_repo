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

    // Create a new project
    const createProject = async () => {
        try{ 
            const body = {
                name: "New Project",
            };
            await fetch("http://localhost:5000/projects", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.error(err.message);
        }
    };

    const deleteProject = async (id) => {
        try {
            await fetch(`http://localhost:5000/projects/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
        } catch (err) {
            console.error(err.message);
        }
    }

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
                        disabled
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
                <div className={styles.delete_proj_btn}>
                    <GButton
                        type="button"
                        warning
                        onClick={() => deleteProject(3)}
                    >
                        Delete Project
                    </GButton>
                </div>
            </div>
            <div className={styles.project_container} style={{ "padding": smallScreen ? "1rem" : "2rem" }}>
                <div className={styles.button_row}>
                    <h1 className={styles.project_header}>Project 2</h1>
                    <GButton
                        type="button"
                        noWrap
                    >
                        Open Project
                    </GButton>
                </div>
            </div>
            <div className={styles.project_container} style={{ "padding": smallScreen ? "1rem" : "2rem" }}>
                <div className={styles.button_row}>
                    <h1 className={styles.project_header}>Project 3</h1>
                    <GButton
                        type="button"
                        noWrap
                    >
                        Open Project
                    </GButton>
                </div>
            </div>

            <div style={{margin: "3rem 0"}}>
                <GButton centered icon={mdiPlus} onClick={createProject}>Create New Project</GButton>
            </div>
        </Fragment>
    );
}