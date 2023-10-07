import React, {Fragment} from 'react';
import styles from './TicketForm.module.css';
import { useState } from 'react';
import { mdiContentSave, mdiDelete } from '@mdi/js';
import { Select } from 'antd';

// components
import GButton from '../GButton/GButton';
import DangerDialog from '../DangerDialog/DangerDialog';

const { Option } = Select;

// Temp options
const epicOptions = [
    "No epic",
    "Epic 1",
    "Epic 2",
    "Epic 3",
];

const typeOptions = [
    "Task",
    "Bug",
    "Spike",
];

const ticketList = [
    "Ticket 1",
    "Ticket 2",
    "Ticket 3",
];

const assigneeOptions = [
    "No asignee",
    "Person 1",
    "Person 2",
    "Person 3",
];

const sprintOptions = [
    "Current sprint",
    "Sprint 2",
    "Sprint 3",
    "Sprint 4",
];

const columnOptions = [
    "To Do",
    "In Progress",
    "Testing",
    "Done",
    "Impeded",
];

export default function TicketForm({closeForm, ticket}) {
    const [formData, setFormData] = useState(ticket || {
        name: "",
        type: "Task",
        epic: "No epic",
        description: "",
        blocks: [],
        blocked_by: [],
        points: 0,
        assignee: "No assignee",
        sprint: "Current sprint",
        column_name: "To Do",
        pull_request: "",
        project: "New Project"
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeEpic = (value) => {
        let name = "epic"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeType = (value) => {
        let name = "type"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeAssignee = (value) => {
        let name = "assignee"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeBlocks = (value) => {
        let name = "blocks"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeBlockedBy = (value) => {
        let name = "blocked_by"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeSprint = (value) => {
        let name = "sprint"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
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
                    type: formData.type,
                    epic: formData.epic,
                    description: formData.description,
                    blocks: formData.blocks,
                    blocked_by: formData.blocked_by,
                    points: formData.points,
                    assignee: formData.assignee,
                    sprint: formData.sprint,
                    column_name: formData.column_name,
                    pull_request: formData.pull_request,
                    project: formData.project
                };
                
                if (ticket) {
                    await fetch(`http://localhost:5000/tickets/${ticket.ticket_id}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        credentials: "include",
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch("http://localhost:5000/tickets", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        credentials: "include",
                        body: JSON.stringify(body)
                    });
                }
                closeForm();
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
            await fetch(`http://localhost:5000/tickets/${ticket.ticket_id}`, {
                method: "DELETE",
                credentials: "include"
            });
            closeForm();
            window.location.reload();
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <Fragment>
            <form id="form" method="post" onSubmit={handleSubmit}>
                <div className={styles.form_section}>
                    <label htmlFor="name">Name:</label>
                    <input maxLength="50" className={styles.dark_input} type="text" id="name" name="name" value={formData.name} onChange={handleChange}/>
                </div>
           
                <div className={styles.form_section}>
                    <label htmlFor="type">Type:</label>
                    <Select
                        dropdownStyle={{ backgroundColor: '#555' }}
                        showSearch
                        optionFilterProp="children"
                        name="type"
                        id="type"
                        defaultValue={formData.type}
                        onChange={handleChangeType}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {typeOptions.map((type, index) => <Option key={index} value={type}>{type}</Option>)}
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
                        defaultValue={formData.epic}
                        onChange={handleChangeEpic}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {epicOptions.map((epic, index) => <Option key={index} value={epic}>{epic}</Option>)}
                    </Select>
                </div>

                <div className={styles.form_section}>
                    <label htmlFor="description">Description:</label>
                    <textarea maxLength="500" className={styles.dark_description} id="description" name="description" value={formData.description} onChange={handleChange}/>
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
                        defaultValue={formData.blocks}
                        onChange={handleChangeBlocks}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {ticketList.map((blocks, index) => <Option key={index} value={blocks}>{blocks}</Option>)}
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
                        defaultValue={formData.blocked_by}
                        onChange={handleChangeBlockedBy}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {ticketList.map((blocked, index) => <Option key={index} value={blocked}>{blocked}</Option>)}
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
                        defaultValue={formData.assignee}
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
                        defaultValue={formData.sprint}
                        onChange={handleChangeSprint}
                        filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {sprintOptions.map((sprint, index) => <Option key={index} value={sprint}>{sprint}</Option>)}
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
                        defaultValue={formData.column_name}
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
                    <input className={styles.dark_input} type="text" id="pull_request" name="pull_request" value={formData.pull_request} onChange={handleChange}/>
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