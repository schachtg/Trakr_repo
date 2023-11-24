import React, {Fragment, useState, useEffect} from 'react';
import styles from './ColumnOrder.module.css';
import { mdiChevronLeft, mdiChevronRight, mdiDelete, mdiPlus } from '@mdi/js';

// Components
import GButton from '../GButton/GButton';

function ColumnBox(props) {
    const [errorMessage, setErrorMessage] = useState("");
    const iconSize = 1.1; 

    const handleMaxChange = (event) => {
      const value = event.target.value;
      props.updateMax(value)
  
      if (!/^\d+$/.test(value) || parseInt(value) < 0 || parseInt(value) > 100) {
        setErrorMessage("Must be an integer between 0 and 100");
      } else {
        setErrorMessage("");
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
                        value={props.title}
                        type="text"
                        onChange={(event) => props.updateName(event.target.value)}
                    />
                </div>
                <div className={styles.input_row}>
                    <span>Max:</span>
                    <input
                        className={styles.max_input}
                        type="text"
                        value={props.max}
                        onChange={handleMaxChange}
                    />
                    {errorMessage && <div className={styles.error_message}>{errorMessage}</div>}
                </div>
                <div className={styles.btn_row}>
                    <div className={styles.grouped_btn}>
                        <GButton
                            onClick={props.moveLeft}
                            disabled={props.position === "first"}
                            icon={mdiChevronLeft}
                            iconSize={iconSize}
                            transparent
                        />
                        <GButton
                            onClick={props.moveRight}
                            disabled={props.position === "last"}
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

export default function ColumnOrder(project_id) {
    const [columns, setColumns] = useState([]);
    const projectID = project_id.project_id;

    const setColumnName = async (index, name) => {
        let newColumns = [...columns];
        newColumns[index].name = name;
        await updateColumn(index, newColumns[index]);
        setColumns(newColumns);
    }

    const setColumnMax = async (index, max) => {
        let newColumns = [...columns];
        newColumns[index].max = max;
        await updateColumn(index, newColumns[index]);
        setColumns(newColumns);
    }

    const moveColumnLeft = async (index) => {
        let newColumns = [...columns];
        let updatedCurrCol = {...columns[index]};
        let updatedPrevCol = {...columns[index - 1]};
        updatedCurrCol.previous = columns[index - 1].previous;
        updatedPrevCol.previous = columns[index].col_id;

        if (index + 1 < columns.length) {
            let updatedNextCol = {...columns[index + 1]};
            updatedNextCol.previous = columns[index-1].col_id;
            newColumns[index + 1] = updatedNextCol;
            await updateColumn(index + 1, updatedNextCol);
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

    const moveColumnRight = async (index) => {
        let newColumns = [...columns];
        let updatedCurrCol = {...columns[index]};
        let updatedNextCol = {...columns[index + 1]};
        updatedCurrCol.previous = columns[index + 1].col_id;
        updatedNextCol.previous = columns[index].previous;

        if (index + 2 < columns.length) {
            let updatedNextNextCol = {...columns[index + 2]};
            updatedNextNextCol.previous = columns[index].col_id;
            newColumns[index + 2] = updatedNextNextCol;
            await updateColumn(index + 2, updatedNextNextCol);
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

    function getPosition(index) {
        if (index === 0) {
            return "first";
        } else if (index === columns.length - 1) {
            return "last";
        } else {
            return "middle";
        }
    }

    const getColumnsFromDB = async event => {
        try{
            const response = await fetch(`http://localhost:5000/cols/${projectID}`, {
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
                project_id: projectID,
                name: "New Column",
                max: 0,
            };
            const response = await fetch("http://localhost:5000/cols/add_single", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            const data = await response.json();
            setColumns([data, ...columns]);
        } catch (err) {
            console.error(err.message);
        }
    }

    const deleteColumn = async (index) => {
        try {
            const body = {
                project_id: projectID,
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

    const updateColumn = async (index, updatedCol) => {
        try {
            const body = {
                name: updatedCol.name,
                max: updatedCol.max,
                previous: updatedCol.previous,
                column_id: columns[index].col_id,
                project_id: projectID,
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
        
        // Find and remove the first element where previous is -1
        let firstElementIndex = oldArray.findIndex((item) => item.previous === -1);
        if (firstElementIndex !== -1) {
            newArray.push(oldArray.splice(firstElementIndex, 1)[0]);
        }
        
        while (oldArray.length > 0) {
            // Find and remove the next element where previous is the last element's col_id
            let nextElementIndex = oldArray.findIndex((item) => item.previous === newArray[newArray.length - 1].col_id);
            if (nextElementIndex !== -1) {
            newArray.push(oldArray.splice(nextElementIndex, 1)[0]);
            } else {
            break;
            }
        }
        
        return newArray;
    }

    useEffect(() => {
        getColumnsFromDB()
            .then((data) => {
                setColumns(orderColumnsByLocation(data));
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
                                title={column.name}
                                max={column.max}
                                previous={column.previous}
                                permanent={column.permanent}
                                updateName={(name) => setColumnName(index, name)}
                                updateMax={(max) => setColumnMax(index, max)}
                                moveLeft={() => moveColumnLeft(index)}
                                moveRight={() => moveColumnRight(index)}
                                deleteColumn={() => deleteColumn(index)}
                            />
                        })}
                    </div>
                </div>
            </div>}
            <div className={styles.invite_btn_container}>
                <GButton onClick={addColumn} icon={mdiPlus}>Add Column</GButton>
            </div>
        </Fragment>
    );
}