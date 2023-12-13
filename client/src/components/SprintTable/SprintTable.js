import React, { Fragment, useState, useEffect } from 'react';
import styles from './SprintTable.module.css';
import { SMALL_WIDTH } from '../../Constants';

// Components
import TicketBox from '../TicketBox/TicketBox';
import NoTicketsAvailable from '../NoTicketsAvailable/NoTicketsAvailable';

let initialized = false;

export default function SprintTable(projectID) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [draggingTicketIndex, setDraggingTicketIndex] = useState(-1);
    const [tickets, setTickets] = useState([]);
    const [columns, setColumns] = useState([]);
    const [largestCol, setLargestCol] = useState(0);
    const project_id = projectID.projectID;
    let smallScreen = windowWidth < SMALL_WIDTH;

    const getLargestCol = (newColumns) => {
        setLargestCol(newColumns.reduce((max, column) => column.size > max ? column.size : max, 0));
    }

    const setTicketsWrapper = async (newTickets) => {
        await getColumnsFromDB().then((data) => {
            setColumns(orderColumnsByLocation(data));
            getLargestCol(data);
        });
        setTickets(newTickets);
    }

    const handleOnDrag = (e, ticket) => {
        setDraggingTicketIndex(tickets.indexOf(ticket));
    }

    const handleOnDrop = async (e, col_name) => {
        if (col_name !== undefined) {
            const cloned = [...tickets];
            cloned[draggingTicketIndex].column_name = col_name;
            await fetch(`http://localhost:5000/tickets/${cloned[draggingTicketIndex].ticket_id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(tickets[draggingTicketIndex])
            });
            setTicketsWrapper(cloned);
        }
    }

    const getTicketsFromDB = async event => {
        try{
            const response = await fetch(`http://localhost:5000/tickets/${project_id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            setTicketsWrapper(data);
        } catch (err) {
            console.error(err.message);
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

    const orderColumnsByLocation = (param) => {
        let oldArray = [...param];
        let newArray = [];

        // Find and remove the first element where next_col is -1
        let firstElementIndex = oldArray.findIndex((item) => item.next_col === -1);
        if (firstElementIndex !== -1) {
            newArray.push(oldArray.splice(firstElementIndex, 1)[0]);
        }
        
        while (oldArray.length > 0) {
            // Find and remove the next element where next_col is the last element's col_id
            let nextElementIndex = oldArray.findIndex((item) => item.next_col === newArray[newArray.length - 1].col_id);
            if (nextElementIndex !== -1) {
            newArray.push(oldArray.splice(nextElementIndex, 1)[0]);
            } else {
            break;
            }
        }

        // Reverse array
        newArray = newArray.reverse();
        
        return newArray;
    }

    const handleOnDragOver = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        if (!initialized) {
            getTicketsFromDB();
            initialized = true;
        }
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        smallScreen = windowWidth < SMALL_WIDTH;
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <Fragment>
            <div className={styles.table_margins}>
                <div className={styles.sprint_row}>
                    {columns.map((column, colIndex) => (
                        <div key={colIndex} className={colIndex === 0 ? styles.sprint_col_left_edge : styles.sprint_col}>
                            <div className={styles.display_max}>
                                {column.max > 0 && <div>
                                    {column.size}/{column.max}
                                </div>}
                            </div>
                            <div className={column.max > 0 && column.max <= column.size ? styles.warning_border : styles.empty_border}>
                                <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>{column.name}</h1>
                                {tickets.map((ticket, ticketIndex) => {
                                    if (ticket.column_name === column.name) {
                                        return <div
                                            key={ticketIndex}
                                            className={styles.sprint_box}
                                            onDrop={(e) => handleOnDrop(e,column.name)}
                                            onDragOver={handleOnDragOver}
                                        >
                                            <TicketBox
                                                handleDragStart={(e) => handleOnDrag(e, ticket)}
                                                ticket={ticket}
                                            />
                                        </div>
                                    } else {
                                        return null;
                                    }
                                })}
                                {Array.from({ length: largestCol - column.size}, (item, boxIndex) => (
                                    <div
                                        key={boxIndex}
                                        className={styles.sprint_box}
                                        onDrop={(e) => handleOnDrop(e,column.name)}
                                        onDragOver={handleOnDragOver}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {tickets.length === 0 && <NoTicketsAvailable /> }
            </div>
        </Fragment>
    );
}