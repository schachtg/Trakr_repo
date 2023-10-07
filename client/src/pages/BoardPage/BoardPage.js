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
    let smallScreen = windowWidth < SMALL_WIDTH;

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

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < SMALL_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    return (
        <Fragment>
            <div className={smallScreen ? styles.page_content_sml : styles.page_content}>
                <div className={styles.title_row}>
                    {!smallScreen && <h1 className={styles.long_text}>Sprint 1</h1>}
                    <h1 className={styles.long_text}>New Project</h1>
                </div>
                <SprintTable />
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
                    <CreateTicketForm closeForm={closeCreateTicket}/>
                </GDialog>
            </div>
            <DangerDialog
                title="Delete ticket"
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