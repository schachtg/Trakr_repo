import React, { Fragment, useEffect, useState } from 'react';
import styles from './TicketsPage.module.css';
import { SMALL_WIDTH, LARGE_WIDTH } from '../../Constants';
import { mdiCloseCircle, mdiPlus, mdiContentSave, mdiDelete } from '@mdi/js';
import { Select } from 'antd';
import { hasPermission } from '../../HelperFunctions';
import { baseURL } from '../../apis/TicketManager';
import ScaleLoader from "react-spinners/ScaleLoader";

// Components
import RowItem from '../../components/RowItem/RowItem';
import GButton from '../../components/GButton/GButton';
import TicketForm from '../../components/TicketForm/TicketForm';
import GDialog from '../../components/GDialog/GDialog';
import DangerDialog from '../../components/DangerDialog/DangerDialog';
import CreateTicketForm from '../../components/TicketForm/TicketForm';
import NoProjectAvailable from '../../components/NoProjectAvailable/NoProjectAvailable';

const { Option } = Select;

export default function TicketsPage() {
    const [loadingPage, setLoadingPage] = useState(true);
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
    const [openNewTicketDialog, setOpenNewTicketDialog] = useState(false);
    const numSprintsDisplayed = 4;
    let smallScreen = windowWidth < SMALL_WIDTH;
    let mediumScreen = windowWidth < LARGE_WIDTH;

    const getOpenProjectID = async () => {
        try {
            const response = await fetch(`${baseURL}/user_info`, {
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
            const response = await fetch(`${baseURL}/projects/${id}`, {
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
            const response = await fetch(`${baseURL}/tickets/project/${project}`, {
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
            setLoadingPage(true);
            const projectId = await getOpenProjectID();
            if (!projectId) {
                setLoadingPage(false);
                return;
            }
            const project = await getProjectFromDB(projectId);
            if (!project) {
                setLoadingPage(false);
                return;
            }
            const tickets = await getTicketsFromDB(projectId);
            if (!tickets) {
                setLoadingPage(false);
                return;
            }
            const epics = await getEpicList(projectId);
            if (!epics) {
                setLoadingPage(false);
                return;
            }

            setOpenProject(project);
            setTickets(tickets);
            setEpicList(epics);
            getTicketsForSprints(tickets, project.curr_sprint, []);
            setLoadingPage(false);
        } catch (err) {
            console.error(err.message);
            setLoadingPage(false);
        }
    }

    const getSprintName = (index) => {
        if (index === numSprintsDisplayed) {
            return "Backlog";
        }
        return `Sprint ${index + openProject.curr_sprint}`;
    }

    const getTicketsForSprints = (newTickets, currSprint, newFilteredEpics) => {
        const sprintTickets = [[], [], [], [], []];
        newTickets.forEach((ticket) => {
            if (
                (ticket.sprint > currSprint + numSprintsDisplayed
                || ticket.sprint < currSprint - 1)
                && ticket.sprint !== 0
            ) {
                return;
            }
            if (newFilteredEpics.length > 0 && !newFilteredEpics.includes(ticket.epic)) {
                return;
            }
            const sprintIndex = ticket.sprint === 0 ? 4 : (ticket.sprint - currSprint);
            sprintTickets[sprintIndex].push(ticket);
        });
        setSprintTickets(sprintTickets);
    }

    const handleStartEditEpic = async (epic) => {
        if (!await hasPermission("Edit tickets", openProject.project_id)) {
            alert("You do not have permission to edit tickets");
            return;
        }
        setEditEpic(epic);
        setNewEpicName(epic.name);
        setNewEpicErrorMessage("");
        setOpenEditEpicDialog(true);
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

    const handleSetNewEpicName = (e) => {
        setNewEpicName(e.target.value);
        if (e.target.value.length === 0) {
            setNewEpicErrorMessage("Name cannot be empty");
        } else if(epicList.some((epic) => epic.name === e.target.value)) {
            setNewEpicErrorMessage("Name already exists");
        } else if(e.target.value.length > 20) {
            setNewEpicErrorMessage("Name cannot be longer than 20 characters");
        } else {
            setNewEpicErrorMessage("");
        }
    }

    const handleOpenTicket = async (ticket) => {
        if (!await hasPermission("Edit tickets", openProject.project_id)) {
            alert("You do not have permission to edit tickets");
            return;
        }
        setOpenTicket(ticket);
    }

    const handleCloseDialog = (value) => {
        if (!value) {
            setOpenTicket(null);
        }
    }

    const handleChangeFilteredEpics = (value) => {
        setFilteredEpics(value);
        getTicketsForSprints(tickets, openProject.curr_sprint, value);
    }

    const handleOpenCreateEpicDialog = async () => {
        if (!await hasPermission("Edit epics", openProject.project_id)) {
            alert("You do not have permission to edit epics");
            return;
        }
        setNewEpicErrorMessage("Name cannot be empty");
        setNewEpicName("");
        setCreateEpicDialog(true);
    }

    const handleOpenCreateTicketDialog = async () => {
        if (!await hasPermission("Edit tickets", openProject.project_id)) {
            alert("You do not have permission to edit tickets");
            return;
        }
        setOpenNewTicketDialog(true);
    }

    const handleCreateEpic = async () => {
        const body = { project_id: openProject.project_id, name: newEpicName, color: "#000000" };
        try{
            const response = await fetch(`${baseURL}/epics`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const message = await response.text();
                alert(message);
            }

            const data = await response.json();
            setEpicList([...epicList, data]);
            setCreateEpicDialog(false);
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
            const response = await fetch(`${baseURL}/epics`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const message = await response.text();
                alert(message);
                window.location.reload();
            }

            const newEpicList = epicList.map((epic) => {
                if (epic.epic_id === editEpic.epic_id) {
                    epic.name = newEpicName;
                }
                return epic;
            }
            );
            setEpicList(newEpicList);
            setOpenEditEpicDialog(false);
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
            await fetch(`${baseURL}/epics`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            const newEpicList = epicList.filter((epic) => epic.epic_id !== editEpic.epic_id);
            setEpicList(newEpicList);
            setOpenDeleteEpicDialog(false);
            setOpenEditEpicDialog(false);
        } catch (err) {
            console.error(err.message);
        }
    }

    const getEpicName = (epicId) => {
        const epic = epicList.find((epic) => epic.epic_id === epicId);
        if (!epic) {
            return "";
        }
        return epic.name;
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
            {loadingPage ?
                <div className={styles.loading}>
                    <ScaleLoader
                        height={70}
                        width={12}
                        radius={3}
                        color={"#34EBBA"}
                        loading={loadingPage}
                    />
                </div>
            :
            <div>
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
                                        {epicList.map((epic, index) => <Option key={index} value={epic.epic_id}>{epic.name}</Option>)}
                                    </Select>
                                </div>
                                <GButton centered icon={mdiPlus} onClick={handleOpenCreateEpicDialog}>Create Epic</GButton>
                            </div>
                            <div className={styles.isolated_button}>
                                <GButton
                                    onClick={handleOpenCreateTicketDialog}
                                    icon={mdiPlus}
                                    type="button"
                                >
                                    Create Ticket
                                </GButton>
                            </div>
                            <GDialog title="Create new ticket" openDialog={openNewTicketDialog} setOpenDialog={setOpenNewTicketDialog}>
                                <CreateTicketForm projectInfo={openProject} closeForm={() => setOpenNewTicketDialog(false)}/>
                            </GDialog>
                            {[...Array(numSprintsDisplayed + 1)].map((e, i) => (
                                <div key={i} className={styles.section_container}>
                                    <h1 className={styles.sprint_title}>{getSprintName(i)}</h1>
                                    <div className={styles.sprint_tickets_container}>
                                        {sprintTickets[i].map((ticket) => (
                                            <RowItem
                                                key={ticket.ticket_id}
                                                title={ticket.name}
                                                subtitle={getEpicName(ticket.epic)}
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
                            <TicketForm projectInfo={openProject} ticket={openTicket} />
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
                {!openProject && <NoProjectAvailable/>}
            </div>}
        </Fragment>
    );
}