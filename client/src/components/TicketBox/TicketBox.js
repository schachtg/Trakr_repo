import React, { Fragment, useState, useEffect } from 'react';
import styles from './TicketBox.module.css';
import GDialog from '../../components/GDialog/GDialog';
import TicketForm from '../TicketForm/TicketForm';
import { SMALL_WIDTH } from '../../Constants';
import { hasPermission } from '../../HelperFunctions';
import { baseURL } from '../../apis/TicketManager';

export default function TicketBox({ticket, handleDragStart, projectInfo}) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [openDialog, setOpenDialog] = useState(false);
    const [epicList, setEpicList] = useState([]);
    let smallScreen = windowWidth < SMALL_WIDTH;

    const openCreateTicket = async () => {
        if (!await hasPermission("Edit tickets", ticket.project_id)) {
            alert("You do not have permission to edit tickets");
            return;
        }
        setOpenDialog(true);
    }

    
    const getEpicList = async (projectId) => {
        try{
            const response = await fetch(`${baseURL}/epics/${projectId}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err.message);
        }
    }

    const closeCreateTicket = () => {
        setOpenDialog(false);
    }

    useEffect(() => {
        getEpicList(projectInfo.project_id).then((data) => {
            setEpicList(data);
        });
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < SMALL_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    const getFormattedPoints = (points) => {
        if(points === "0.0") {
            return "0";
        }
        if (typeof points === 'number') {
            if (Number.isInteger(points)) {
                return points.toFixed(0);
            } else {
                return points.toFixed(1);
            }
        } else {
            if (parseFloat(points)) {
                if (Number.isInteger(parseFloat(points))) {
                    return parseFloat(points).toFixed(0);
                } else {
                    return parseFloat(points).toFixed(1);
                }
            } else {
                return '';
            }
        }
    }

    const getEpicName = (epicId) => {
        const epic = epicList.find((epic) => epic.epic_id === epicId);
        if (!epic) {
            return "";
        }
        return epic.name;
    }

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
                        {(getEpicName(ticket.epic) !== "") && <h1 className={styles.ticket_epic}>{getEpicName(ticket.epic)}</h1>}
                        <div className={styles.ticket_footer}>
                            <h1 className={styles.ticket_asignee}>{ticket.assignee !== "No assignee" && ticket.assignee}</h1>
                            <div className={styles.points_container}>
                                <h1 className={styles.ticket_points}>
                                    {getFormattedPoints(ticket.points)}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <GDialog title={ticket.name} openDialog={openDialog} setOpenDialog={setOpenDialog}>
                <TicketForm projectInfo={projectInfo} ticket={ticket} closeForm={closeCreateTicket}/>
            </GDialog>
        </Fragment>
    );
}