import React, { Fragment, useEffect, useState } from 'react';
import styles from './TicketsPage.module.css';
import { SMALL_WIDTH, LARGE_WIDTH } from '../../Constants';
import { mdiCloseCircle } from '@mdi/js';

// Components
import RowItem from '../../components/RowItem/RowItem';
import GButton from '../../components/GButton/GButton';
import TicketForm from '../../components/TicketForm/TicketForm';
import GDialog from '../../components/GDialog/GDialog';

export default function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [openProject, setOpenProject] = useState(null);
    const [sprintTickets, setSprintTickets] = useState([[], [], [], [], []]);// 4 sprints + backlog
    const [openTicket, setOpenTicket] = useState(null); // [ticket_id, ticket_name
    const numSprintsDisplayed = 4;
    let smallScreen = windowWidth < SMALL_WIDTH;
    let mediumScreen = windowWidth < LARGE_WIDTH;

    const getOpenProjectID = async () => {
        try {
            const response = await fetch(`http://localhost:5000/user_info`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            if (!data.open_project) {
                return;
            }
            return data.open_project;
        } catch (err) {
            console.error(err.message);
        }
    }

    const getProjectFromDB = async (id) => {
        try{
            const response = await fetch(`http://localhost:5000/projects/${id}`, {
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

    const getTicketsFromDB = async (project) => {
        try{
            const response = await fetch(`http://localhost:5000/tickets/project/${project}`, {
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

    const initializeProject = async () => {
        try {
            const projectId = await getOpenProjectID();
            if (!projectId) {
                return;
            }
            const project = await getProjectFromDB(projectId);
            if (!project) {
                return;
            }
            const tickets = await getTicketsFromDB(projectId);
            if (!tickets) {
                return;
            }
            setOpenProject(project);
            setTickets(tickets);
            getTicketsForSprints(tickets, project.curr_sprint);
        } catch (err) {
            console.error(err.message);
        }
    }

    const getSprintName = (index) => {
        if (index === numSprintsDisplayed) {
            return "Backlog";
        }
        return `Sprint ${index + openProject.curr_sprint}`;
    }

    const getTicketsForSprints = (newTickets, currSprint) => {
        const sprintTickets = [[], [], [], [], []];
        newTickets.forEach((ticket) => {
            if (ticket.sprint > currSprint + numSprintsDisplayed) {
                return;
            }
            const sprintIndex = ticket.sprint == 0 ? 4 : (ticket.sprint - currSprint);
            console.log(ticket.sprint);
            sprintTickets[sprintIndex].push(ticket);
        });
        setSprintTickets(sprintTickets);
    }

    const handleOpenTicket = (ticket) => {
        console.log(ticket);
        setOpenTicket(ticket);
    }

    const handleCloseDialog = (value) => {
        if (!value) {
            setOpenTicket(null);
        }
    }

    useEffect(() => {
        initializeProject();
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        smallScreen = windowWidth < SMALL_WIDTH;
        mediumScreen = windowWidth < LARGE_WIDTH;
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <Fragment>
            {openProject && <div className={smallScreen ? styles.page_content_sml : styles.page_content}>
                <div className={styles.layout_container}>
                    <div className={styles.ticket_list}>
                        {[...Array(numSprintsDisplayed + 1)].map((e, i) => (
                            <div key={i} className={styles.section_container}>
                                <h1 className={styles.sprint_title}>{getSprintName(i)}</h1>
                                <div className={styles.sprint_tickets_container}>
                                    {sprintTickets[i].map((ticket) => (
                                        <RowItem
                                            key={ticket.ticket_id}
                                            title={ticket.name}
                                            subtitle={ticket.epic === "No epic" ? "" : ticket.epic}
                                            strikethrough={ticket.column_name === "Done"}
                                            onClick={() => handleOpenTicket(ticket)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {(!mediumScreen && openTicket) && <div className={styles.ticket_details}>
                        <div className={styles.header_row}>
                            <h1 className={styles.long_text}>{openTicket.name}</h1>
                            <GButton
                                icon={mdiCloseCircle}
                                transparent
                                iconSize={1.7}
                                className={styles.close_btn}
                                onClick={() => setOpenTicket(null)}
                                type="button"
                            />
                        </div>
                        <TicketForm projectInfo={openProject} ticket={openTicket}/>
                    </div>}
                    {(mediumScreen && openTicket) && <GDialog title={openTicket.name} openDialog={openTicket} setOpenDialog={handleCloseDialog}>
                        <TicketForm projectInfo={openProject} />
                    </GDialog>}
                </div>
            </div>}
        </Fragment>
    );
}