import React, { Fragment, useState, useEffect } from 'react';
import styles from './SprintTable.module.css';
import { SMALL_WIDTH } from '../../Constants';

// Components
import TicketBox from '../TicketBox/TicketBox';

let ticketsDefault = [
    {
        id: 0,
        title: "Update Board",
        epic: "Epic 1",
        assignee: "No assignee",
        points: 3,
        column_name: "Impeded"
    },
    {
        id: 1,
        title: "Add New Login System",
        epic: "Epicnennsefjsofifafjoiasfj 1",
        assignee: "Shana Sickbal",
        points: 0.5,
        column_name: "Done"
    },
    {
        id: 3,
        title: "Add Notifications",
        epic: "Epic 4",
        assignee: "Peter Parker",
        points: 2.3,
        column_name: "To Do"
    },
    {
        id: 4,
        title: "Add adsdas",
        epic: "Epic 4",
        assignee: "Pesdsdasdter Parker",
        points: 2.3,
        column_name: "To Do"
    },
    {
        id: 2,
        title: "Integrate Multiple Users In Projects Tab",
        epic: "No epic",
        assignee: "Graham Cracker",
        points: 4,
        column_name: "In Progress"
    },
];

let columnsDefault = [
    {
        name: "Impeded",
        size: 0,
        max: 1
    },
    {
        name: "To Do",
        size: 0,
        max: 0
    },
    {
        name: "In Progress",
        size: 0,
        max: 0
    },
    {
        name: "Testing",
        size: 0,
        max: 0
    },
    {
        name: "Done",
        size: 0,
        max: 0
    }
];

let initialized = false;
let largestColTemp = 0;

export default function SprintTable() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [draggingTicketIndex, setDraggingTicketIndex] = useState(-1);
    const [tickets, setTickets] = useState(ticketsDefault);
    const [columns, setColumns] = useState(columnsDefault);
    const [largestCol, setLargestCol] = useState(largestColTemp);
    let smallScreen = windowWidth < SMALL_WIDTH;

    const getLargestCol = () => {
        largestColTemp = 0;
        columnsDefault.forEach(column => {
            if (column.size > largestColTemp) {
                largestColTemp = column.size;
            }
        });
        setLargestCol(largestColTemp);
    }

    const setColumnsWrapper = (newColumns) => {
        setColumns(newColumns);
        getLargestCol();
    }

    const setTicketsWrapper = (newTickets) => {
        columnsDefault.forEach(column => {
            column.size = 0;
        });
        newTickets.forEach(ticket => {
            columnsDefault.find(column => column.name === ticket.column_name).size += 1;
        });
        setColumnsWrapper(columnsDefault);
        setTickets(newTickets);
    }

    const handleOnDrag = (e, ticket) => {
        setDraggingTicketIndex(tickets.indexOf(ticket));
    }

    const handleOnDrop = (e, col_name) => {
        if (col_name !== undefined) {
            const cloned = [...tickets];
            cloned[draggingTicketIndex].column_name = col_name;
            setTicketsWrapper(cloned);
        }
    }

    const handleOnDragOver = (e) => {
        e.preventDefault();
    }

    useEffect(() => {
        if (!initialized) {
            setTicketsWrapper(ticketsDefault);
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
    });

    return (
        <Fragment>
            <div className={styles.sprint_row}>
                {columns.map((column, colIndex) => (
                    <div key={colIndex} className={column.name === "Impeded" ? styles.sprint_col_impeded : styles.sprint_col}>
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
        </Fragment>
    );
}