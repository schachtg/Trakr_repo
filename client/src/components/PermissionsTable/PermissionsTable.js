import React from 'react';
import styles from './PermissionsTable.module.css';

export default function PermissionsTable() {
    return (
        <div className={styles.table__container}>
            <h1 className={styles.table__title}>Permissions</h1>
            <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}></th>
                    <th className={styles.th}>Permission 1</th>
                    <th className={styles.th}>Permnfsjkdfndkjfnksjfnkfission 2</th>
                    <th className={styles.th}>Permission 3</th>
                    {/* Add more column names as needed */}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>User 1:</td>
                    <td>
                        <input type="checkbox" />
                    </td>
                    <td>
                        <input type="checkbox" />
                    </td>
                    <td>
                        <input type="checkbox" />
                    </td>
                    {/* Add more rows and checkboxes for each user */}
                    </tr>
                    <tr>
                    <td>User 2:</td>
                    <td>
                        <input type="checkbox" />
                    </td>
                    <td>
                        <input type="checkbox" />
                    </td>
                    <td>
                        <input type="checkbox" />
                    </td>
                </tr>
                {/* Add more rows for additional users */}
            </tbody>
            </table>
        </div>
    );
}