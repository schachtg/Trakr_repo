import React, { Fragment, useState, useEffect } from 'react';
import styles from './TicketBox.module.css';
import GDialog from '../../components/GDialog/GDialog';
import TicketForm from '../../components/TicketForm/TicketForm';
import { SMALL_WIDTH } from '../../Constants';

export default function TicketBox({ticket}) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [openDialog, setOpenDialog] = useState(false);
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
            <div className={styles.outer_container}>
                <div onClick={openCreateTicket} className={smallScreen ? styles.ticket_box_sml : styles.ticket_box_lrg}>
                    <h1 className={styles.ticket_title}>{ticket.title}</h1>
                    <div className={styles.ticket_body}>
                        <h1 className={styles.ticket_asignee}>{ticket.assignee}</h1>
                        <div className={styles.points_container}>
                            <h1 className={styles.ticket_points}>{ticket.points}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <GDialog openDialog={openDialog} setOpenDialog={setOpenDialog}>
                <TicketForm closeForm={closeCreateTicket}/>
            </GDialog>
        </Fragment>
    );
}