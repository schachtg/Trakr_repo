import React, { Fragment } from 'react';
import styles from './SprintPage.module.css';
import { useState, useEffect } from 'react';
import { mdiPlus, mdiChevronRight } from '@mdi/js';

// components
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';
import SprintTable from '../../components/SprintTable/SprintTable';
import CreateTicketForm from '../../components/TicketForm/TicketForm';
import { SMALL_WIDTH } from '../../Constants';

export default function SprintPage() {
    const [openDialog, setOpenDialog] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < SMALL_WIDTH;

    const openCreateTicket = () => {
        setOpenDialog(true);
    }

    const closeCreateTicket = () => {
        setOpenDialog(false);
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
                    >
                        Next Sprint
                    </GButton>
                </div>
                <GDialog openDialog={openDialog} setOpenDialog={setOpenDialog}>
                    <CreateTicketForm closeForm={closeCreateTicket}/>
                </GDialog>
            </div>
        </Fragment>
    );
}