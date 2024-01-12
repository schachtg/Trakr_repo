import React, {Fragment, useEffect} from 'react';
import styles from './TicketForm.module.css';
import { useState } from 'react';
import { mdiContentSave, mdiDelete } from '@mdi/js';
import { Select } from 'antd';
import { baseURL } from '../../apis/TicketManager';

// components
import GButton from '../GButton/GButton';
import DangerDialog from '../DangerDialog/DangerDialog';

const { Option } = Select;

// Temp options

const priorityOptions = [
    "Very high",
    "High",
    "Medium",
    "Low",
    "Very low",
];

export default function TicketForm({closeForm, ticket, projectInfo}) {
    const [formData, setFormData] = useState({
        name: "",
        priority: "Medium",
        epic: -1,
        description: "",
        blocks: [],
        blocked_by: [],
        points: 0,
        assignee: "No assignee",
        sprint: projectInfo.curr_sprint,
        column_name: "To Do",
        pull_request: "",
        project_id: projectInfo.project_id
    });
    const [displayedFormData, setDisplayedFormData] = useState({
        name: "",
        priority: "Medium",
        epic: "No epic",
        description: "",
        blocks: [],
        blocked_by: [],
        points: 0,
        assignee: "No assignee",
        sprint: projectInfo.curr_sprint,
        column_name: "To Do",
        pull_request: "",
        project_id: projectInfo.project_id
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [epicOptions, setEpicOptions] = useState([]);
    const [ticketOptions, setTicketOptions] = useState([]);
    const [sprintOptions, setSprintOptions] = useState([0]);
    const [assigneeOptions, setAssigneeOptions] = useState([]);
    const [columnOptions, setColumnOptions] = useState([]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeEpic = (value) => {
        let name = "epic"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

        // Get the name of the epic with epic_id equal to value
        let epic = epicOptions.find(epic => epic.epic_id === value);
        if (epic) {
            setDisplayedFormData((prevFormData) => ({ ...prevFormData, [name]: epic.name }));
        } else {
            setDisplayedFormData((prevFormData) => ({ ...prevFormData, [name]: "No epic" }));
        }
    };

    const handleChangePriority = (value) => {
        let name = "priority"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeAssignee = (value) => {
        let name = "assignee"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeBlocks = (value) => {
        let name = "blocks"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

        // Get the name of the ticket with ticket_id equal to value
        let blocks = [];
        value.forEach(ticket_id => {
            const ticket = ticketOptions.find(ticket => ticket.ticket_id === ticket_id);
            if (ticket) {
                blocks.push(ticket.name);
            }
        });

        setDisplayedFormData((prevFormData) => ({ ...prevFormData, [name]: blocks }));
    };

    const handleChangeBlockedBy = (value) => {
        let name = "blocked_by"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

        let blocked = [];
        value.forEach(ticket_id => {
            const ticket = ticketOptions.find(ticket => ticket.ticket_id === ticket_id);
            if (ticket) {
                blocked.push(ticket.name);
            }
        });

        setDisplayedFormData((prevFormData) => ({ ...prevFormData, [name]: blocked }));
    };

    const handleChangeSprint = (value) => {
        let name = "sprint"
        const displayedSprint = value !== 0 ? value : "Backlog";
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setDisplayedFormData((prevFormData) => ({ ...prevFormData, [name]: displayedSprint }));
    };

    const handleChangeColumn = (value) => {
        let name = "column_name"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const hasMoreThanOneDecimalPlace = (value) => {
        const pattern = /^\d+\.\d{2,}$/;
        return pattern.test(value);
    };

    const handleChangePoints = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

        // Checks for correct format
        if (isNaN(parseFloat(value))) {
            setErrorMessage('Please enter a number');
            return;
        }
        if (hasMoreThanOneDecimalPlace(value)) {
            setErrorMessage('Please enter a number with at most one decimal place');
            return;
        }
        if (value < 0) {
            setErrorMessage('Please enter a positive number');
            return;
        }
        if (value > 100) {
            setErrorMessage('Please enter a number less than or equal to 100');
            return;
        }
        if (!isFinite(value)) {
            setErrorMessage('Please enter a finite number');
            return;
        }
        setErrorMessage('');
    };

    const getBranchName = () => {
        let branchName = "";
        if (formData.name !== "") {
            branchName = `git checkout -b ${formData.name.toLowerCase().replace(/ /g, "-")}`;
        }
        return branchName;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (errorMessage !== '') {
            alert('Please fix the errors in the form');
            return;
        } else {
            try{ 
                const body = {
                    name: formData.name,
                    priority: formData.priority,
                    epic: formData.epic,
                    description: formData.description,
                    blocks: formData.blocks,
                    blocked_by: formData.blocked_by,
                    points: formData.points,
                    assignee: formData.assignee,
                    sprint: formData.sprint,
                    column_name: formData.column_name,
                    pull_request: formData.pull_request,
                    project_id: formData.project_id
                };
                
                if (ticket) {
                    await fetch(`${baseURL}/tickets/${ticket.ticket_id}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        credentials: "include",
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch(`${baseURL}/tickets`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        credentials: "include",
                        body: JSON.stringify(body)
                    });
                }
                if(closeForm) {
                    closeForm();
                }
                window.location.reload();
            } catch (err) {
                console.error(err.message);
            }
        }
    };

    const handleDeleteWarning = () => {
        setDeleteDialog(true);
    }

    const handleDeleteTicket = async (event) => {
        event.preventDefault();
        setDeleteDialog(false)
        try{
            await fetch(`${baseURL}/tickets/${ticket.ticket_id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if(closeForm) {
                closeForm();
            }
            window.location.reload();
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleUpdateEpicOptions = async () => {
        try {
            const response = await fetch(`${baseURL}/epics/${projectInfo.project_id}`, {
                method: "GET",
                credentials: "include"
            });
            const jsonData = await response.json();
            setEpicOptions([{name: "No epic", epic_id: -1}]);
            jsonData.forEach(epic => {
                setEpicOptions(prevEpicOptions => [...prevEpicOptions, epic]);
            });
            return jsonData;
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleUpdateTicketOptions = async () => {
        try {
            const response = await fetch(`${baseURL}/tickets/project/${projectInfo.project_id}`, {
                method: "GET",
                credentials: "include"
            });
            const jsonData = await response.json();
            setTicketOptions(jsonData);
            return jsonData;
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleUpdateSprintOptions = () => {
        try {
            let tempSprintOptions = [0];
            for (let i = 0; i < 4; i++) {
                tempSprintOptions.push(projectInfo.curr_sprint + i);
            }
            setSprintOptions(tempSprintOptions);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleUpdateAssigneeOptions = async () => {
        let tempAssigneeOptions = ["No assignee"];
        try {
            const response = await fetch(`${baseURL}/user_info/project/${projectInfo.project_id}`, {
                method: "GET",
                credentials: "include"
            });
            const jsonData = await response.json();
            jsonData.forEach(user => {
                tempAssigneeOptions.push(user.name);
            });
            setAssigneeOptions(tempAssigneeOptions);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleUpdateColumnOptions = async () => {
        try {
            const response = await fetch(`${baseURL}/cols/${projectInfo.project_id}`, {
                method: "GET",
                credentials: "include"
            });
            const jsonData = await response.json();
            setColumnOptions(jsonData.map(col => col.name));
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        handleUpdateTicketOptions().then((tickets) => {
            handleUpdateEpicOptions().then((epics) => {
                if (ticket) {
                    const displayedBlocks = ticket.blocks.length > 0 ? tickets.filter(t => ticket.blocks.includes(t.ticket_id)).map(t => t.name) : [];
                    const displayedBlocked = ticket.blocked_by.length > 0 ? tickets.filter(t => ticket.blocked_by.includes(t.ticket_id)).map(t => t.name) : [];
                    let tempEpic = epics.find(epic => epic.epic_id === ticket.epic);
                    const displayedEpic = tempEpic !== undefined ? tempEpic.name : "No epic";
                    const displayedSprint = ticket.sprint !== 0 ? ticket.sprint : "Backlog";
                    const blocks = ticket.blocks.length > 0 ? ticket.blocks.filter(t => tickets.filter(innerTicket => innerTicket.ticket_id === t).length > 0) : [];
                    const blocked = ticket.blocked_by.length > 0 ? ticket.blocked_by.filter(t => tickets.filter(innerTicket => innerTicket.ticket_id === t).length > 0) : [];
                    setFormData({
                        name: ticket.name,
                        priority: ticket.priority,
                        epic: ticket.epic,
                        description: ticket.description,
                        blocks: blocks,
                        blocked_by: blocked,
                        points: ticket.points,
                        assignee: ticket.assignee,
                        sprint: ticket.sprint,
                        column_name: ticket.column_name,
                        pull_request: ticket.pull_request,
                        project_id: projectInfo.project_id
                    });
                    setDisplayedFormData({
                        name: ticket.name,
                        priority: ticket.priority,
                        epic: displayedEpic,
                        description: ticket.description,
                        blocks: displayedBlocks,
                        blocked_by: displayedBlocked,
                        points: ticket.points,
                        assignee: ticket.assignee,
                        sprint: displayedSprint,
                        column_name: ticket.column_name,
                        pull_request: ticket.pull_request,
                        project_id: projectInfo.project_id
                    });
                }
            });
        });
        handleUpdateSprintOptions();
        handleUpdateAssigneeOptions();
        handleUpdateColumnOptions();
    }, [ticket]);

    return (
        <Fragment>
            <form id="form" method="post" onSubmit={handleSubmit}>
                <div className={styles.form_section}>
                    <label htmlFor="name">Name:</label>
                    <input maxLength="50" className={styles.dark_input} type="text" id="name" name="name" value={formData.name} onChange={handleChange}/>
                </div>
           
                <div className={styles.form_section}>
                    <label htmlFor="type">Priority:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="priority"
                        id="priority"
                        value={formData.priority}
                        onChange={handleChangePriority}
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {priorityOptions.map((priority, index) => <Option key={index} value={priority}>{priority}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="epic">Epic:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="epic"
                        id="epic"
                        value={displayedFormData.epic}
                        onChange={handleChangeEpic}
                        onFocus={handleUpdateEpicOptions}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {epicOptions.map((epic, index) => <Option key={index} value={epic.epic_id}>{epic.name}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="description">Description:</label>
                    <textarea maxLength="250" className={styles.dark_description} id="description" name="description" value={formData.description} onChange={handleChange}/>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="blocks">Blocks:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="blocks"
                        id="blocks"
                        mode="multiple"
                        value={formData.blocks}
                        defaultValue={displayedFormData.blocks}
                        onChange={handleChangeBlocks}
                        onFocus={handleUpdateTicketOptions}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {ticketOptions.map((blocks, index) => <Option key={index} value={blocks.ticket_id}>{blocks.name}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="blocked_by">Blocked by:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="blocked_by"
                        id="blocked_by"
                        mode="multiple"
                        value={formData.blocked_by}
                        defaultValue={displayedFormData.blocked_by}
                        onChange={handleChangeBlockedBy}
                        onFocus={handleUpdateTicketOptions}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {ticketOptions.map((blocked, index) => <Option key={index} value={blocked.ticket_id}>{blocked.name}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="points">Challenge points:</label>
                    <input className={styles.dark_input} type="text" id="points" name="points" value={formData.points} onChange={handleChangePoints}/>
                    {errorMessage && <span className={styles.error_text}>{errorMessage}</span>}
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="assignee">Assignee:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="assignee"
                        id="assignee"
                        value={formData.assignee}
                        onChange={handleChangeAssignee}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {assigneeOptions.map((assignee, index) => <Option key={index} value={assignee}>{assignee}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="sprint">Sprint:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="sprint"
                        id="sprint"
                        value={displayedFormData.sprint}
                        onChange={handleChangeSprint}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {sprintOptions.map((sprint, index) => <Option key={index} value={sprint}>{sprint !== 0 ? sprint : "Backlog"}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="column_name">Column:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="column_name"
                        id="column_name"
                        value={formData.column_name}
                        onChange={handleChangeColumn}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {columnOptions.map((column_name, index) => <Option key={index} value={column_name}>{column_name}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="pull_request">Link to pull request:</label>
                    <input maxLength="200" className={styles.dark_input} type="text" id="pull_request" name="pull_request" value={formData.pull_request} onChange={handleChange}/>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="create_branch">Create branch:</label>
                    <input readOnly className={styles.dark_input_readonly} type="text" id="pull_request" name="pull_request" value={getBranchName()}/>
                </div>

                <div className={styles.button_row}>
                    <GButton
                        icon={mdiContentSave}
                        type="submit"
                    >
                        Save
                    </GButton>
                    {ticket && <GButton
                        icon={mdiDelete}
                        onClick={handleDeleteWarning}
                        type="button"
                        warning
                    >
                        Delete
                    </GButton>}
                </div>
            </form>
            <DangerDialog
                title="Delete ticket"
                openDialog={deleteDialog}
                buttons={[
                    <GButton
                        onClick={() => setDeleteDialog(false)}
                        type="button"
                    >
                        Cancel
                    </GButton>,
                    <GButton
                        onClick={handleDeleteTicket}
                        type="button"
                        warning
                    >
                        Delete
                    </GButton>
                ]}
            >
                <span>Are you sure you want to delete this ticket?</span>
            </DangerDialog>
        </Fragment>
    );
}