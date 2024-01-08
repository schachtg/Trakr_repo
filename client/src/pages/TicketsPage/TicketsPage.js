import React, { Fragment, useEffect, useState } from 'react';
import styles from './TicketsPage.module.css';
import { SMALL_WIDTH, LARGE_WIDTH } from '../../Constants';
import { mdiCloseCircle, mdiPlus, mdiContentSave, mdiDelete } from '@mdi/js';
import { Select } from 'antd';

// Components
import RowItem from '../../components/RowItem/RowItem';
import GButton from '../../components/GButton/GButton';
import TicketForm from '../../components/TicketForm/TicketForm';
import GDialog from '../../components/GDialog/GDialog';
import DangerDialog from '../../components/DangerDialog/DangerDialog';

const { Option } = Select;

export default function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [epicList, setEpicList] = useState([]);
    const [createEpicDialog, setCreateEpicDialog] = useState(false);
    const [newEpicName, setNewEpicName] = useState("");
    const [newEpicErrorMessage, setNewEpicErrorMessage] = useState("");
    const [editEpic, setEditEpic] = useState({name: "", color: ""});
    const [openEditEpicDialog, setOpenEditEpicDialog] = useState(false);
    const [openDeleteEpicDialog, setOpenDeleteEpicDialog] = useState(false);
    const [filteredEpics, setFilteredEpics] = useState([]);
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
            const epics = await getEpicList(projectId);
            if (!epics) {
                return;
            }

            setOpenProject(project);
            setTickets(tickets);
            setEpicList(epics);
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
            sprintTickets[sprintIndex].push(ticket);
        });
        setSprintTickets(sprintTickets);
    }

    const handleStartEditEpic = (epic) => {
        setEditEpic(epic);
        setNewEpicName(epic.name);
        setNewEpicErrorMessage("");
        setOpenEditEpicDialog(true);
    }

    const getEpicList = async (projectId) => {
        try{
            const response = await fetch(`http://localhost:5000/epics/${projectId}`, {
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

    const handleSetNewEpicName = (e) => {
        setNewEpicName(e.target.value);
        if (e.target.value.length === 0) {
            setNewEpicErrorMessage("Name cannot be empty");
        } else {
            setNewEpicErrorMessage("");
        }
    }

    const handleOpenTicket = (ticket) => {
        setOpenTicket(ticket);
    }

    const handleCloseDialog = (value) => {
        if (!value) {
            setOpenTicket(null);
        }
    }

    const handleChangeFilteredEpics = (value) => {
        setFilteredEpics(value);
    }

    const handleCreateEpic = async () => {
        const body = { project_id: openProject.project_id, name: "New Epic", color: "#000000" };
        try{
            const response = await fetch(`http://localhost:5000/epics`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleSaveNewName = async () => {
        const body = {
            epic_id: editEpic.epic_id,
            project_id: editEpic.project_id,
            name: newEpicName,
            color: editEpic.color
        };
        try{
            await fetch(`http://localhost:5000/epics`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleDeleteWarning = () => {
        setOpenDeleteEpicDialog(true);
    }

    const handleDeleteEpic = async () => {
        const body = {
            epic_id: editEpic.epic_id,
            project_id: editEpic.project_id,
        };
        try{
            await fetch(`http://localhost:5000/epics`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.error(err.message);
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
                        <div className={styles.epics_box}>
                            <h1>Epics</h1>
                            {epicList.length > 0 && <RowItem
                                title="Epic List"
                                childRows={epicList.map((epic) => (
                                    {
                                        title: epic.name,
                                        onClick: () => handleStartEditEpic(epic)
                                    }
                                ))}
                            />}
                            <div className={styles.labeled_section}>
                                <label htmlFor="filter">Filter:</label>
                                <Select
                                    dropdownStyle={{ backgroundColor: '#555' }}
                                    showSearch
                                    optionFilterProp="children"
                                    name="filter"
                                    id="filter"
                                    mode="multiple"
                                    value={filteredEpics}
                                    onChange={handleChangeFilteredEpics}
                                    filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {epicList.map((epic, index) => <Option key={index} value={epic.name}>{epic.name}</Option>)}
                                </Select>
                            </div>
                            <GButton icon={mdiPlus} onClick={handleCreateEpic}>Create Epic</GButton>
                        </div>
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
                    <GDialog fitContent title="Create Epic" openDialog={createEpicDialog} setOpenDialog={setCreateEpicDialog}>
                        <label htmlFor="name">Name:</label>
                        <div className={styles.form_section}>
                            <input className={styles.dark_input} type="text" id="name" name="name" onChange={handleSetNewEpicName}/>
                            {newEpicErrorMessage && <div className={styles.error_message}>{newEpicErrorMessage}</div>}
                        </div>
                        <div className={styles.button_row}>
                            <GButton
                                onClick={() => setCreateEpicDialog(false)}
                                type="button"
                                warning
                                alternate
                            >
                                Cancel
                            </GButton>
                            <GButton
                                icon={mdiContentSave}
                                onClick={handleCreateEpic}
                                disabled={newEpicErrorMessage.length > 0}
                            >
                                Save
                            </GButton>
                        </div>
                    </GDialog>
                    <GDialog fitContent title="Edit Epic" openDialog={openEditEpicDialog} setOpenDialog={setOpenEditEpicDialog}>
                        <label htmlFor="editName">Name:</label>
                        {epicList.length > 0 && <div className={styles.form_section}>
                            <input className={styles.dark_input} type="text" id="editName" name="editName" value={newEpicName} onChange={handleSetNewEpicName}/>
                            {newEpicErrorMessage && <div className={styles.error_message}>{newEpicErrorMessage}</div>}
                        </div>}
                        <div className={styles.button_row}>
                            <GButton
                                icon={mdiContentSave}
                                type="submit"
                                onClick={handleSaveNewName}
                                disabled={newEpicErrorMessage.length > 0}
                            >
                                Save
                            </GButton>
                            <GButton
                                icon={mdiDelete}
                                onClick={handleDeleteWarning}
                                type="button"
                                warning
                            >
                                Delete
                            </GButton>
                        </div>
                    </GDialog>
                    {epicList.length > 0 && <DangerDialog
                        title="Delete Epic"
                        openDialog={openDeleteEpicDialog}
                        buttons={[
                            <GButton
                                onClick={() => setOpenDeleteEpicDialog(false)}
                                type="button"
                            >
                                Cancel
                            </GButton>,
                            <GButton
                                onClick={handleDeleteEpic}
                                type="button"
                                warning
                            >
                                Delete
                            </GButton>
                        ]}
                    >
                        Are you sure you want to delete the epic {editEpic.name}?
                    </DangerDialog>}
                </div>
            </div>}
        </Fragment>
    );
}