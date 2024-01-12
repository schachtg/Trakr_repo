import React, {Fragment, useState, useEffect} from 'react';
import styles from './ColumnOrder.module.css';
import { mdiChevronLeft, mdiChevronRight, mdiDelete, mdiPlus, mdiContentSave } from '@mdi/js';
import { hasPermission } from '../../HelperFunctions';

// Components
import GButton from '../GButton/GButton';
import GDialog from '../GDialog/GDialog';
import DangerDialog from '../DangerDialog/DangerDialog';

function ColumnBox(props) {
    const [topErrorMessage, setTopBottomErrorMessage] = useState("");
    const [bottomErrorMessage, setBottomErrorMessage] = useState("");
    const iconSize = 1.1;

    const handleNameChange = async (event) => {
        const value = event.target.value;
        props.updateName(value)
        if (value.length >= 15) {
            setTopBottomErrorMessage("Must be less than 15 characters");
        } else if (value.length === 0) {
            setTopBottomErrorMessage("Must not be empty");
        } else if (props.columns.filter((column) => column.name === value).length > 1) {
            setTopBottomErrorMessage("Must be unique");
        } else {
            setTopBottomErrorMessage("");
        }
    };

    const handleMaxChange = async (event) => {
        const value = event.target.value;
        props.updateMax(value)

        if (!/^\d+$/.test(value) || parseInt(value) < 0 || parseInt(value) > 100) {
            setBottomErrorMessage("Must be an integer between 0 and 100");
        } else {
            setBottomErrorMessage("");
        }
    };

    return(
        <Fragment>
            <div className={styles.column_box}>
                <div className={styles.input_row}>
                    <span>Name:</span>
                    <input
                        readOnly={props.permanent}
                        className={props.permanent ? styles.input_readonly : styles.max_input}
                        value={props.name}
                        type="text"
                        onChange={handleNameChange}
                    />
                    {topErrorMessage && <div className={styles.error_message}>{topErrorMessage}</div>}
                </div>
                <div className={styles.input_row}>
                    <span>Max:</span>
                    <input
                        className={styles.max_input}
                        type="text"
                        value={props.max}
                        onChange={handleMaxChange}
                    />
                    {bottomErrorMessage && <div className={styles.error_message}>{bottomErrorMessage}</div>}
                </div>
                <div className={styles.btn_row}>
                    <div className={styles.grouped_btn}>
                        <GButton
                            onClick={props.moveLeft}
                            disabled={props.position === "first" || props.position === "only"}
                            icon={mdiChevronLeft}
                            iconSize={iconSize}
                            transparent
                        />
                        <GButton
                            onClick={props.moveRight}
                            disabled={props.position === "last" || props.position === "only"}
                            icon={mdiChevronRight}
                            iconSize={iconSize}
                            transparent
                        />
                    </div>
                    <GButton disabled={props.permanent} onClick={props.deleteColumn} icon={mdiDelete} iconSize={iconSize} warning transparent />
                </div>
            </div>
        </Fragment>
    );
}

export default function ColumnOrder({project_id}) {
    const [columns, setColumns] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteWarning, setOpenDeleteWarning] = useState(false);
    const [deletingColumn, setDeletingColumn] = useState(0);
    const [addNameErrorMsg, setAddNameErrorMsg] = useState("");
    const [addMaxErrorMsg, setAddMaxErrorMsg] = useState("");
    const [newColumn, setNewColumn] = useState({name: "", max: 0});

    const handleNameChange = async (event) => {
        const value = event.target.value;
        setNewColumn({name: value, max: newColumn.max})
        if (value.length >= 15) {
            setAddNameErrorMsg("Must be less than 15 characters");
        } else if (value.length === 0) {
            setAddNameErrorMsg("Must not be empty");
        } else if (columns.filter((column) => column.name === value).length >= 1) {
            setAddNameErrorMsg("Must be unique");
        } else {
            setAddNameErrorMsg("");
        }
    };

    const handleMaxChange = async (event) => {
        const value = event.target.value;
        setNewColumn({name: newColumn.name, max: value})
        if (!/^\d+$/.test(value) || parseInt(value) < 0 || parseInt(value) > 100) {
            setAddMaxErrorMsg("Must be an integer between 0 and 100");
        } else {
            setAddMaxErrorMsg("");
        }
    };

    const setColumnName = async (index, name) => {
        // Ensure that columns are up to date before updating
        const dbColumns = await getColumnsFromDB();
        const orderedColumns = updatePermanentColumns(orderColumnsByLocation(dbColumns));
        if (JSON.stringify(orderedColumns) !== JSON.stringify(columns)) {
            window.location.reload();
            alert("An error occurred. Please try again.");
        } else {
            if (!await hasPermission("Edit columns", project_id)) {
                alert("You do not have permission to edit columns");
                return;
            }
            let newColumns = [...columns];
            newColumns[index].name = name;
            if (newColumns.filter((column) => column.name === name).length <= 1 && name.length < 15 && name.length > 0) {
                await updateColumn(index, newColumns[index]);
            }
            setColumns(newColumns);
        }
    }

    const setColumnMax = async (index, max) => {
        // Ensure that columns are up to date before updating
        const dbColumns = await getColumnsFromDB();
        const orderedColumns = updatePermanentColumns(orderColumnsByLocation(dbColumns));
        if (JSON.stringify(orderedColumns) !== JSON.stringify(columns)) {
            window.location.reload();
            alert("An error occurred. Please try again.");
        } else {
            if (!await hasPermission("Edit columns", project_id)) {
                alert("You do not have permission to edit columns");
                return;
            }
            let newColumns = [...columns];
            newColumns[index].max = max;
            if (!(!/^\d+$/.test(max) || parseInt(max) < 0 || parseInt(max) > 100)) {
                await updateColumn(index, newColumns[index]);
            }
            setColumns(newColumns);
        }
    }

    const moveColumnLeft = async (index) => {
        // Ensure that columns are up to date before upodating
        const dbColumns = await getColumnsFromDB();
        const orderedColumns = updatePermanentColumns(orderColumnsByLocation(dbColumns));
        if (JSON.stringify(orderedColumns) !== JSON.stringify(columns)) {
            window.location.reload();
            alert("An error occurred. Please try again.");
        } else {
            if (!await hasPermission("Edit columns", project_id)) {
                alert("You do not have permission to edit columns");
                return;
            }
            let newColumns = [...columns];
            let updatedCurrCol = {...columns[index]};
            let updatedPrevCol = {...columns[index - 1]};
            updatedCurrCol.next_col = columns[index - 1].col_id;
            updatedPrevCol.next_col = columns[index].next_col;

            if (index - 2 >= 0) {
                let updatedPrevPrevCol = {...columns[index - 2]};
                updatedPrevPrevCol.next_col = columns[index].col_id;
                newColumns[index - 2] = updatedPrevPrevCol;
                await updateColumn(index - 2, updatedPrevPrevCol);
            }

            newColumns[index] = updatedCurrCol;
            newColumns[index - 1] = updatedPrevCol;

            await updateColumn(index, updatedCurrCol);
            await updateColumn(index - 1, updatedPrevCol);

            let temp = newColumns[index - 1];
            newColumns[index - 1] = newColumns[index];
            newColumns[index] = temp;
            setColumns(newColumns);
        }
    }

    const moveColumnRight = async (index) => {
        // Ensure that columns are up to date before updating
        const dbColumns = await getColumnsFromDB();
        const orderedColumns = updatePermanentColumns(orderColumnsByLocation(dbColumns));
        if (JSON.stringify(orderedColumns) !== JSON.stringify(columns)) {
            window.location.reload();
            alert("An error occurred. Please try again.");
        } else {
            if (!await hasPermission("Edit columns", project_id)) {
                alert("You do not have permission to edit columns");
                return;
            }
            let newColumns = [...columns];
            let updatedCurrCol = {...columns[index]};
            let updatedNextCol = {...columns[index + 1]};
            updatedCurrCol.next_col = columns[index + 1].next_col;
            updatedNextCol.next_col = columns[index].col_id;

            if (index - 1 >= 0) {
                let updatedPrevCol = {...columns[index - 1]};
                updatedPrevCol.next_col = columns[index + 1].col_id;
                newColumns[index - 1] = updatedPrevCol;
                await updateColumn(index - 1, updatedPrevCol);
            }

            newColumns[index] = updatedCurrCol;
            newColumns[index + 1] = updatedNextCol;

            await updateColumn(index, updatedCurrCol);
            await updateColumn(index + 1, updatedNextCol);

            let temp = newColumns[index + 1];
            newColumns[index + 1] = newColumns[index];
            newColumns[index] = temp;
            setColumns(newColumns);
        }
    }

    function getPosition(index) {
        if (columns.length === 1) {
            return "only";
        } else if (index === 0) {
            return "first";
        } else if (index === columns.length - 1) {
            return "last";
        } else {
            return "middle";
        }
    }

    const getColumnsFromDB = async event => {
        try{
            const response = await fetch(`http://localhost:5000/cols/${project_id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err.message);
        }
    }

    const addColumn = async () => {
        try{ 
            const body = {
                project_id: project_id,
                name: newColumn.name,
                max: newColumn.max,
            };
            const response = await fetch("http://localhost:5000/cols/add_single", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                alert("An error occurred. Please try again.");
                window.location.reload();
                return;
            }
            const data = await response.json();
            const newColumns = [...columns];
            if (newColumns.length > 0) {
                newColumns[0].next_col = data.col_id;
            }
            const completeColumn = {
                col_id: data.col_id,
                name: data.name,
                max: data.max,
                next_col: -1,
                size: 0,
            }
            setColumns([completeColumn, ...newColumns]);
        } catch (err) {
            console.error(err.message);
        }
    }

    const deleteColumn = async (index) => {
        // Ensure that columns are up to date before updating
        const dbColumns = await getColumnsFromDB();
        const orderedColumns = updatePermanentColumns(orderColumnsByLocation(dbColumns));
        if (JSON.stringify(orderedColumns) !== JSON.stringify(columns)) {
            window.location.reload();
            alert("An error occurred. Please try again.");
        } else {
            if (!await hasPermission("Edit columns", project_id)) {
                alert("You do not have permission to edit columns");
                return;
            }
            try {
                setDeletingColumn(0);
                setOpenDeleteWarning(false);
                const body = {
                    project_id: project_id,
                    column_id: columns[index].col_id
                };
                await fetch(`http://localhost:5000/cols`, {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(body)
                });
                const newColumns = [...columns];
                const data = newColumns.filter((column) => column.col_id !== columns[index].col_id)
                setColumns(data);
            } catch (err) {
                console.error(err.message);
            }
        }
    }

    const updateColumn = async (index, updatedCol) => {
        if (!await hasPermission("Edit columns", project_id)) {
            alert("You do not have permission to edit columns");
            return;
        }
        try {
            const body = {
                name: updatedCol.name,
                max: updatedCol.max,
                next_col: updatedCol.next_col,
                size: updatedCol.size,
                column_id: columns[index].col_id,
                project_id: project_id,
            };
            await fetch(`http://localhost:5000/cols`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    const orderColumnsByLocation = (param) => {
        let oldArray = [...param];
        let newArray = [];
        
        // Find and remove the first element where next_col is -1
        let firstElementIndex = oldArray.findIndex((item) => item.next_col === -1);
        if (firstElementIndex !== -1) {
            newArray.push(oldArray.splice(firstElementIndex, 1)[0]);
        }
        
        const getNextElementIndex = (col_id) => {
            return oldArray.findIndex((item) => item.next_col === col_id);
        }

        while (oldArray.length > 0) {
            // Find and remove the next element where next_col is the last element's col_id
            let nextElementIndex = getNextElementIndex(newArray[newArray.length - 1].col_id);
            if (nextElementIndex !== -1) {
            newArray.push(oldArray.splice(nextElementIndex, 1)[0]);
            } else {
            break;
            }
        }

        // Reverse the array
        newArray = newArray.reverse();

        return newArray;
    }

    const updatePermanentColumns = (peram) => {
        let newColumns = [...peram];
        for (let i = 0; i < newColumns.length; i++) {
            newColumns[i].permanent = newColumns[i].name === "To Do" || newColumns[i].name === "Done";
        }
        return newColumns;
    }

    const openAddColumn = async () => {
        if (!await hasPermission("Edit columns", project_id)) {
            alert("You do not have permission to edit columns");
            return;
        }
        setNewColumn({name: "", max: 0});
        setAddNameErrorMsg("Must not be empty");
        setAddMaxErrorMsg("");
        setOpenDialog(true);
    }

    const openDeleteColumn = async (index) => {
        if (!await hasPermission("Edit columns", project_id)) {
            alert("You do not have permission to edit columns");
            return;
        }
        setDeletingColumn(index);
        setOpenDeleteWarning(true);
    }

    useEffect(() => {
        getColumnsFromDB()
            .then((data) => {
                setColumns(updatePermanentColumns(orderColumnsByLocation(data)));
            });
    }, []);

    return (
        <Fragment>
            {columns.length > 0 && <div className={styles.scroll_container}>
                <div className={styles.columns_container}>
                    <div className={styles.outer_container}>
                        {columns.map((column, index) => {
                            return <ColumnBox
                                key={index}
                                position={getPosition(index)}
                                name={column.name}
                                max={column.max}
                                next_col={column.next_col}
                                permanent={column.permanent}
                                updateName={(name) => setColumnName(index, name)}
                                updateMax={(max) => setColumnMax(index, max)}
                                moveLeft={() => moveColumnLeft(index)}
                                moveRight={() => moveColumnRight(index)}
                                deleteColumn={() => openDeleteColumn(index)}
                                columns={columns}
                            />
                        })}
                    </div>
                </div>
            </div>}
            <div className={styles.invite_btn_container}>
                <GButton onClick={openAddColumn} icon={mdiPlus}>Add Column</GButton>
            </div>
            <GDialog fitContent title="Add Column" openDialog={openDialog} setOpenDialog={setOpenDialog}>
                <form onSubmit={addColumn}>
                    <div className={styles.form_section}>
                        <label htmlFor="name">Name:</label>
                        <input className={styles.add_input} type="text" id="name" name="name" value={newColumn.name} onChange={handleNameChange}/>
                        {addNameErrorMsg && <div className={styles.error_message}>{addNameErrorMsg}</div>}
                    </div>
                    <div className={styles.form_section}>
                        <label htmlFor="max">Max:</label>
                        <input className={styles.add_input} type="text" id="max" name="max" value={newColumn.max} onChange={handleMaxChange}/>
                        {addMaxErrorMsg && <div className={styles.error_message}>{addMaxErrorMsg}</div>}
                    </div>
                    <div className={styles.button_row}>
                        <GButton
                            onClick={() => setOpenDialog(false)}
                            type="button"
                            warning
                            alternate
                        >
                            Cancel
                        </GButton>
                        <GButton
                            icon={mdiContentSave}
                            type="submit"
                            disabled={addNameErrorMsg || addMaxErrorMsg}
                        >
                            Save
                        </GButton>
                    </div>
                </form>
            </GDialog>
            <DangerDialog
                title="Delete Column"
                openDialog={openDeleteWarning}
                buttons={[
                    <GButton
                        onClick={() => setOpenDeleteWarning(false)}
                        type="button"
                    >
                        Cancel
                    </GButton>,
                    <GButton
                        icon={mdiDelete}
                        type="button"
                        onClick={() => deleteColumn(deletingColumn)}
                        warning
                    >
                        Delete
                    </GButton>
                ]}
            >
                {columns.length > 0 && <span>
                    Are you sure you want to delete the column {columns[deletingColumn].name}?
                </span>}
            </DangerDialog>
        </Fragment>
    );
}