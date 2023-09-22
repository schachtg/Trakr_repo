import React, { Fragment, useState, useEffect } from 'react';
import styles from './SprintTable.module.css';
import { SMALL_WIDTH } from '../../Constants';

// Components
import TicketBox from '../TicketBox/TicketBox';

const tickets = [
    {
        title: "Update Board",
        assignee: "No assignee",
        points: 3,
        column_name: "Impeded"
    },
    {
        title: "Add New Login System",
        assignee: "Shana Sickbal",
        points: 0.5,
        column_name: "Done"
    },
    {
        title: "Integrate Multiple Users In Projects Tab",
        assignee: "Graham Cracker",
        points: 4,
        column_name: "In Progress"
    },
    {
        title: "Add Notifications",
        assignee: "Peter Parker",
        points: 2.3,
        column_name: "To Do"
    }
];

const columns = [
    {
        name: "Impeded",
        warning: true
    },
    {
        name: "To Do",
        warning: true
    },
    {
        name: "In Progress",
        warning: true
    },
    {
        name: "Testing",
        warning: true
    },
    {
        name: "Done",
        warning: true
    }
];

export default function SprintTable() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    let colMax = [true, false, false, false, false]
    let smallScreen = windowWidth < SMALL_WIDTH;

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
            <div className={styles.sprint_row}>
                <div className={styles.sprint_col_impeded}>
                    <div className={colMax[0] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>Impeded</h1>
                        {tickets.map((ticket, index) => (
                            <div key={index} className={styles.sprint_box}>
                                {ticket.column_name === columns[0].name && <TicketBox ticket={ticket}/>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                    <div className={colMax[1] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>To Do</h1>
                        {tickets.map((ticket, index) => (
                            <div key={index} className={styles.sprint_box}>
                                {ticket.column_name === columns[1].name && <TicketBox ticket={ticket}/>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                <div className={colMax[2] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>In Progress</h1>
                        {tickets.map((ticket, index) => (
                            <div key={index} className={styles.sprint_box}>
                                {ticket.column_name === columns[2].name && <TicketBox ticket={ticket}/>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                <div className={colMax[3] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>Testing</h1>
                        {tickets.map((ticket, index) => (
                            <div key={index} className={styles.sprint_box}>
                                {ticket.column_name === columns[3].name && <TicketBox ticket={ticket}/>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sprint_col}>
                <div className={colMax[4] ? styles.warning_border : styles.empty_border}>
                        <h1 className={smallScreen ? styles.col_name_sml : styles.col_name}>Done</h1>
                        {tickets.map((ticket, index) => (
                            <div key={index} className={styles.sprint_box}>
                                {ticket.column_name === columns[4].name && <TicketBox ticket={ticket}/>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}