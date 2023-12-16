import React, { Fragment } from 'react';
import styles from './BoardPage.module.css';
import { useState, useEffect } from 'react';
import { mdiPlus, mdiChevronRight } from '@mdi/js';
import { SMALL_WIDTH } from '../../Constants';

// components
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';
import SprintTable from '../../components/SprintTable/SprintTable';
import CreateTicketForm from '../../components/TicketForm/TicketForm';
import DangerDialog from '../../components/DangerDialog/DangerDialog';

export default function BoardPage() {
    const [openDialog, setOpenDialog] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [nextSprintDialog, setNextSprintDialog] = useState(false);
    const [openProject, setOpenProject] = useState(null);
    let smallScreen = windowWidth < SMALL_WIDTH;

    const getProjectFromDB = async (id) => {
        try{
            const response = await fetch(`http://localhost:5000/projects/${id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            setOpenProject(data);
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
            if (!data.open_project) {
                return;
            }
            await getProjectFromDB(data.open_project);
        } catch (err) {
            console.error(err.message);
        }
    }

    const openCreateTicket = () => {
        setOpenDialog(true);
    }

    const closeCreateTicket = () => {
        setOpenDialog(false);
    }

    const handleNextSprintWarning = () => {
        setNextSprintDialog(true);
    }

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };
        initializeOpenProject();

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < SMALL_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <Fragment>
            {openProject && <div className={smallScreen ? styles.page_content_sml : styles.page_content}>
                <div className={styles.title_row}>
                    {!smallScreen && <h1 className={styles.long_text}>Sprint {openProject.curr_sprint}</h1>}
                    <h1 className={styles.long_text}>{openProject.name}</h1>
                </div>
                <SprintTable projectID={openProject.project_id}/>
                <div className={styles.create_ticket_row}>
                    <GButton
                        onClick={openCreateTicket}
                        icon={mdiPlus}
                        type="button"
                    >
                        Create Ticket
                    </GButton>
                </div>
                <div className={styles.next_sprint_row}>
                    <GButton
                        icon={mdiChevronRight}
                        type="button"
                        warning
                        alternate
                        onClick={handleNextSprintWarning}
                    >
                        Next Sprint
                    </GButton>
                </div>
                <GDialog title="Create new ticket" openDialog={openDialog} setOpenDialog={setOpenDialog}>
                    <CreateTicketForm projectInfo={openProject} closeForm={closeCreateTicket}/>
                </GDialog>
            </div>}
            <DangerDialog
                title="End Sprint"
                openDialog={nextSprintDialog}
                buttons={[
                    <GButton
                        onClick={() => setNextSprintDialog(false)}
                        type="button"
                    >
                        Cancel
                    </GButton>,
                    <GButton
                        type="button"
                        warning
                    >
                        Next Sprint
                    </GButton>
                ]}
            >
                <span>
                    Are you sure you want to end the current sprint?
                    All unfinished tickets will be moved to the next sprint
                    while the finished tickets are deleted.
                </span>
            </DangerDialog>
        </Fragment>
    );
}