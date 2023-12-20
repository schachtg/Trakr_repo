import React, { Fragment, useEffect, useState } from 'react';
import styles from './ProjectsPage.module.css';
import UserList from '../../components/UserList/UserList';
import GButton from '../../components/GButton/GButton';
import { mdiPlus, mdiDelete, mdiContentSave } from '@mdi/js';
import PermissionsTable from '../../components/PermissionsTable/PermissionsTable';
import ColumnOrder from '../../components/ColumnOrder/ColumnOrder';
import { MEDIUM_WIDTH, PERMISSION_LIST } from '../../Constants';
import DangerDialog from '../../components/DangerDialog/DangerDialog';
import { hasPermission } from '../../HelperFunctions';
import GDialog from '../../components/GDialog/GDialog';

export default function ProjectsPage() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [projects, setProjects] = useState([]); // [ {project_id: 1, name: "Project 1"}, {project_id: 2, name: "Project 2"}, ...
    const [openProject, setOpenProject] = useState(null);
    const [createProjectDialog, setCreateProjectDialog] = useState(false);
    const [newProjectErrorMessage, setNetProjectErrorMessage] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [roles, setRoles] = useState([]);
    const [openDeleteWarning, setOpenDeleteWarning] = useState(false);
    let smallScreen = windowWidth < MEDIUM_WIDTH;

    // Create a new project
    const createProject = async () => {
        try{ 
            const body = {
                name: newProjectName,
            };
            const data = await fetch("http://localhost:5000/projects", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            const response = await data.json();

            // Create default columns
            const defaultColumns = { columns: [
                {
                    name: "To Do",
                    size: 0,
                    project_id: response.project_id,
                    max: 0
                },
                {
                    name: "In Progress",
                    size: 0,
                    project_id: response.project_id,
                    max: 0
                },
                {
                    name: "Testing",
                    size: 0,
                    project_id: response.project_id,
                    max: 0
                },
                {
                    name: "Done",
                    size: 0,
                    project_id: response.project_id,
                    max: 0
                },
            ]};

            const defaultRoles = { roles: [
                    {
                        name: "Admin",
                        permissions: [...Array(PERMISSION_LIST.length)].map((e) => true),
                        user_emails: [response.user_emails[0]]
                    },
                    {
                        name: "Default",
                        permissions: [...Array(PERMISSION_LIST.length)].map((e) => false),
                        user_emails: []
                    },
                ],
                project_id: response.project_id
            };

            await fetch("http://localhost:5000/cols", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(defaultColumns)
            });

            await fetch("http://localhost:5000/roles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(defaultRoles)
            });

            setProjects([...projects, response]);
            setCreateProjectDialog(false);
        } catch (err) {
            console.error(err.message);
        }
    };

    const deleteProject = async (id) => {
        try {
            setOpenProjectDB(null);
            await fetch(`http://localhost:5000/projects/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            setProjects(projects.filter(project => project.project_id !== id));
        } catch (err) {
            console.error(err.message);
        }
    }

    const getProjectsFromDB = async event => {
        try{
            const response = await fetch("http://localhost:5000/projects", {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            console.error(err.message);
        }
    }

    const initializeOpenProject = async () => {
        try{
            const response = await fetch(`http://localhost:5000/user_info`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            setOpenProject(data.open_project);
        } catch (err) {
            console.error(err.message);
        }
    }

    const setOpenProjectDB = async (id) => {
        try{ 
            const body = {
                open_project: id,
            };
            await fetch("http://localhost:5000/user_info/open_project", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            window.location.reload();
        } catch (err) {
            console.error(err.message);
        }
    }


    const currentProject = () => {
        return projects.find(project => project.project_id === openProject) || {name: ""};
    }

    const handleOpenDeleteWarning = async () => {
        if (!await hasPermission("Delete project", openProject)) {
            alert("You do not have permission to delete the project");
            return;
        }
        setOpenDeleteWarning(true);
    }

    const handleSetNewProjectName = (event) => {
        const value = event.target.value;
        setNewProjectName(value);
        if (value.length >= 30) {
            setNetProjectErrorMessage("Must be less than 30 characters");
        } else if (value.length === 0) {
            setNetProjectErrorMessage("Must not be empty");
        } else {
            setNetProjectErrorMessage("");
        }
    }

    const handleOpenCreateProjectDialog = () => {
        setNewProjectName("");
        setNetProjectErrorMessage("Must not be empty");
        setCreateProjectDialog(true);
    }

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        getProjectsFromDB();
        initializeOpenProject();

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < MEDIUM_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <Fragment>
            {openProject && <div className={styles.project_container} style={{ "padding": smallScreen ? "1rem" : "2rem" }}>
                <h1 className={styles.project_header}>{currentProject().name}</h1>
                <div className={styles.section_container} style={{ "width": "100%" }}>
                    <h1 className={styles.table_title}>Columns</h1>
                    <ColumnOrder project_id={openProject}/>
                </div>
                <div className={styles.project_row} style={{ "flexDirection": smallScreen ? "column" : "row" }}>
                    <div className={styles.section_container} style={{ "width": smallScreen ? "100%" : "50%" }}>
                        <h1 className={styles.table_title}>Users</h1>
                        <UserList project_id={openProject} roles={roles} setRoles={setRoles}/>
                    </div>
                    <div className={styles.section_container} style={{ "width": smallScreen ? "100%" : "50%" }}>
                        <h1 className={styles.table_title}>Permissions</h1>
                        <PermissionsTable project_id={openProject} roles={roles} setRoles={setRoles}/>
                    </div>
                </div>
                <div className={styles.delete_proj_btn}>
                    <GButton
                        type="button"
                        warning
                        onClick={handleOpenDeleteWarning}
                    >
                        Delete Project
                    </GButton>
                </div>
            </div>}

            {projects.map((project, index) => (
                project.project_id !== openProject && <div key={index} className={styles.project_container} style={{ "padding": smallScreen ? "1rem" : "2rem" }}>
                    <div className={styles.button_row}>
                        <h1 className={styles.project_header}>{project.name}</h1>
                        <GButton
                            type="button"
                            noWrap
                            onClick={() => setOpenProjectDB(project.project_id)}
                        >
                            Open Project
                        </GButton>
                    </div>
                </div>
            ))}
            <div style={{margin: "3rem 0"}}>
                <GButton centered icon={mdiPlus} onClick={handleOpenCreateProjectDialog}>Create New Project</GButton>
            </div>
            <GDialog fitContent title="Create New Project" openDialog={createProjectDialog} setOpenDialog={setCreateProjectDialog}>
                <label htmlFor="name">Name:</label>
                <div className={styles.form_section}>
                    <input className={styles.dark_input} type="text" id="name" name="name" onChange={handleSetNewProjectName}/>
                    {newProjectErrorMessage && <div className={styles.error_message}>{newProjectErrorMessage}</div>}
                </div>
                <div className={styles.button_row}>
                    <GButton
                        onClick={() => setCreateProjectDialog(false)}
                        type="button"
                        warning
                        alternate
                    >
                        Cancel
                    </GButton>
                    <GButton
                        icon={mdiContentSave}
                        onClick={createProject}
                        disabled={newProjectErrorMessage.length > 0}
                    >
                        Save
                    </GButton>
                </div>
            </GDialog>
            {openProject && <DangerDialog
                title="Delete Project"
                openDialog={openDeleteWarning}
                buttons={[
                    <GButton
                        onClick={() => setOpenDeleteWarning(false)}
                        type="button"
                    >
                        Cancel
                    </GButton>,
                    <GButton
                        icon={mdiDelete}
                        type="button"
                        onClick={() => deleteProject(openProject)}
                        warning
                    >
                        Delete
                    </GButton>
                ]}
            >
                <span>
                    Are you sure you want to delete the project {currentProject().name}?
                </span>
            </DangerDialog>}
        </Fragment>
    );
}