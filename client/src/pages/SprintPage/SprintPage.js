import React, { Fragment } from 'react';
import styles from './SprintPage.module.css';
import { useState, useEffect } from 'react';
import { mdiPlus, mdiContentSave } from '@mdi/js';
import { Select } from 'antd';

// components
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';
import SprintCol from '../../components/SprintCol/SprintCol';
import { SMALL_WIDTH } from '../../Constants';

const { Option } = Select;

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

export default function SprintPage() {
    const [openDialog, setOpenDialog] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let smallScreen = windowWidth < SMALL_WIDTH;
    const [formData, setFormData] = useState({
        name: "",
        type: "Task",
        epic: "",
        description: "",
        blocks: [],
        blockedBy: [],
        points: 0,
        assignee: "",
        sprint: "Current sprint",
        column: "To Do",
        project: "New Project"
    });
    const [errorMessage, setErrorMessage] = useState('');

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
        let name = "blockedBy"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleChangeSprint = (value) => {
        let name = "sprint"
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try{ 
            const body = {
                name: formData.name,
                type: formData.type,
                epic: formData.epic,
                description: formData.description,
                blocks: formData.blocks,
                blockedBy: formData.blockedBy,
                points: formData.points,
                assignee: formData.assignee,
                sprint: formData.sprint,
                column: formData.column,
                project: formData.project
            };
            const response = await fetch("http://localhost:5000/username/tickets", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            window.location = "/";
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleChangePoints = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

        // Validate input and set error message
        if (!isValidNumber(value)) {
            setErrorMessage('Please enter a valid number');
        } else {
            setErrorMessage('');
        }
    };

    const isValidNumber = (value) => {
        // Use regex or parseFloat to check if the input is a number
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    const openCreateTicket = () => {
        setOpenDialog(true);
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
                <SprintCol />
                <div className={styles.create_ticket_row}>
                    <GButton
                        onClick={openCreateTicket}
                        icon={mdiPlus}
                    >
                        Create Ticket
                    </GButton>
                </div>
                <GDialog openDialog={openDialog} setOpenDialog={setOpenDialog}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.form_section}>
                            <label htmlFor="name">Name:</label>
                            <input className={styles.dark_input} type="text" id="name" name="name" value={formData.name} onChange={handleChange}/>
                        </div>

                        
                        <div className={styles.form_section}>
                            <label htmlFor="type">Type:</label>
                            <Select
                                dropdownStyle={{ backgroundColor: '#555' }}
                                showSearch
                                optionFilterProp="children"
                                name="type"
                                defaultValue = "Task"
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
                                defaultValue = "No Epic"
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
                            <textarea className={styles.dark_description} id="description" name="description" value={formData.description} onChange={handleChange}/>
                        </div>

                        <div className={styles.form_section}>
                            <label htmlFor="blocks">Blocks:</label>
                            <Select
                                dropdownStyle={{ backgroundColor: '#555' }}
                                showSearch
                                optionFilterProp="children"
                                name="blocks"
                                mode="multiple"
                                onChange={handleChangeBlocks}
                                filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {ticketList.map((blocks, index) => <Option key={index} value={blocks}>{blocks}</Option>)}
                            </Select>
                        </div>

                        <div className={styles.form_section}>
                            <label htmlFor="blockedBy">Blocked by:</label>
                            <Select
                                dropdownStyle={{ backgroundColor: '#555' }}
                                showSearch
                                optionFilterProp="children"
                                name="blockedBy"
                                mode="multiple"
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
                            {errorMessage && <p style={{ color: '#ff1f75' }}>{errorMessage}</p>}
                        </div>

                        <div className={styles.form_section}>
                            <label htmlFor="assignee">Assignee:</label>
                            <Select
                                dropdownStyle={{ backgroundColor: '#555' }}
                                showSearch
                                optionFilterProp="children"
                                name="assignee"
                                defaultValue = "No assignee"
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
                                defaultValue = "Current sprint"
                                onChange={handleChangeSprint}
                                filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {sprintOptions.map((sprint, index) => <Option key={index} value={sprint}>{sprint}</Option>)}
                            </Select>
                        </div>

                        <GButton
                            onClick={openCreateTicket}
                            icon={mdiContentSave}
                            type="submit"
                        >
                            Save
                        </GButton>
                    </form>
                </GDialog>
            </div>
        </Fragment>
    );
}