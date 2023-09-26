import React, { Fragment, useState, useEffect } from 'react';
import styles from './TicketBox.module.css';
import GDialog from '../../components/GDialog/GDialog';
import TicketForm from '../TicketForm/TicketForm';
import { SMALL_WIDTH } from '../../Constants';

export default function TicketBox({ticket, handleDragStart}) {
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
                <div
                    draggable
                    onDragStart={handleDragStart}
                    className={smallScreen ? styles.ticket_box_sml : styles.ticket_box_lrg}
                    onClick={openCreateTicket}
                >
                    <h1 className={styles.ticket_title}>{ticket.name}</h1>
                    <div className={styles.ticket_body}>
                        {(ticket.epic !== "No epic" && ticket.epic !== "") && <h1 className={styles.ticket_epic}>{ticket.epic}</h1>}
                        <div className={styles.ticket_footer}>
                            <h1 className={styles.ticket_asignee}>{ticket.assignee !== "No assignee" && ticket.assignee}</h1>
                            <div className={styles.points_container}>
                                <h1 className={styles.ticket_points}>{ticket.points}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <GDialog title={ticket.name} openDialog={openDialog} setOpenDialog={setOpenDialog}>
                <TicketForm ticket={ticket} closeForm={closeCreateTicket}/>
            </GDialog>
        </Fragment>
    );
}