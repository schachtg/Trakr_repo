import React, { Fragment, useState, useEffect } from 'react';
import styles from './SprintTable.module.css';
import { SMALL_WIDTH } from '../../Constants';
import { hasPermission } from '../../HelperFunctions';
import { baseURL } from '../../apis/TicketManager';

// Components
import TicketBox from '../TicketBox/TicketBox';
import NoTicketsAvailable from '../NoTicketsAvailable/NoTicketsAvailable';

let initialized = false;

export default function SprintTable({projectInfo}) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [draggingTicketIndex, setDraggingTicketIndex] = useState(-1);
    const [tickets, setTickets] = useState([]);
    const [columns, setColumns] = useState([]);
    const [largestCol, setLargestCol] = useState(0);
    let smallScreen = windowWidth < SMALL_WIDTH;

    const getLargestCol = (newTickets, newColumns) => {
        // Look through each ticket in the current sprint for the project and find the largest column
        let largest = 0;
        for (let i = 0; i < newColumns.length; i++) {
            let size = newTickets.filter((ticket) => 
                ticket.column_name === newColumns[i].name
                && ticket.project_id === projectInfo.project_id
                && ticket.sprint === projectInfo.curr_sprint).length;
            if (size > largest) {
                largest = size;
            }
        }

        setLargestCol(largest);
    }

    const setTicketsWrapper = async (newTickets) => {
        await getColumnsFromDB().then((data) => {
            setColumns(orderColumnsByLocation(data));
            getLargestCol(newTickets, data);
        });
        setTickets(newTickets);
    }

    const handleOnDrag = async (e, ticket) => {
        setDraggingTicketIndex(tickets.indexOf(ticket));
    }

    const handleOnDrop = async (e, col_name) => {
        if (!await hasPermission("Edit tickets", projectInfo.project_id)) {
            alert("You do not have permission to edit tickets");
            return;
        }
        const ticketInDB = await fetch(`${baseURL}/tickets/${tickets[draggingTicketIndex].ticket_id}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        });
        if (ticketInDB.status !== 200) {
            alert("Ticket no longer exists");
            getTicketsFromDB();
            return;
        }

        if (col_name !== undefined) {
            const cloned = [...tickets];
            cloned[draggingTicketIndex].column_name = col_name;
            await fetch(`${baseURL}/tickets/${cloned[draggingTicketIndex].ticket_id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(tickets[draggingTicketIndex])
            });
            getTicketsFromDB();
        }
    }

    const getTicketsFromDB = async event => {
        try{
            const response = await fetch(`${baseURL}/tickets/project/${projectInfo.project_id}`, {
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
            const response = await fetch(`${baseURL}/cols/${projectInfo.project_id}`, {
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

        // Reverse array
        newArray = newArray.reverse();
        
        return newArray;
    }

    const handleOnDragOver = (e) => {
        e.preventDefault();
    }

    const getColumnSize = (col_id) => {
        let col = columns.find((col) => col.col_id === col_id);
        if (col === undefined) {
            return 0;
        } else {
            return tickets.filter((ticket) => 
                ticket.column_name === col.name
                && ticket.project_id === projectInfo.project_id
                && ticket.sprint === projectInfo.curr_sprint).length;
        }
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
                                    {getColumnSize(column.col_id)}/{column.max}
                                </div>}
                            </div>
                            <div className={column.max > 0 && column.max <= getColumnSize(column.col_id) ? styles.warning_border : styles.empty_border}>
                                <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>{column.name}</h1>
                                {tickets.filter((t) => t.sprint === projectInfo.curr_sprint).map((ticket, ticketIndex) => {
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
                                                projectInfo={projectInfo}
                                            />
                                        </div>
                                    } else {
                                        return null;
                                    }
                                })}
                                {Array.from({ length: largestCol - getColumnSize(column.col_id)}, (item, boxIndex) => (
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
                {largestCol <= 0 && <NoTicketsAvailable /> }
            </div>
        </Fragment>
    );
}