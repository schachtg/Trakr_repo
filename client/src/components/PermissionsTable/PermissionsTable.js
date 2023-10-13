import React, {useState} from 'react';
import styles from './PermissionsTable.module.css';
import { mdiPlus, mdiPencil } from '@mdi/js';
import Icon from '@mdi/react';

// COMPONENTS
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';
import DangerDialog from '../../components/DangerDialog/DangerDialog';

let defaultPermissions = [
    "Permission 1",
    "Permission 2",
    "Permission 3"
]

let defaultRoles = [
    {
        id: 0,
        name: "Role 1",
        permissions: [
            true,
            true,
            false,
        ],
    },
    {
        id: 1,
        name: "Role 2",
        permissions: [
            true,
            false,
            true,
        ],
    },
    {
        id: 2,
        name: "Role 3",
        permissions: [
            false,
            false,
            false,
        ],
    },
]

export default function PermissionsTable() {
    const [openDialog, setOpenDialog] = useState(false);
    const [editRoleIndex, setEditRoleIndex] = useState(0);
    const [permissions] = useState(defaultPermissions);
    const [roles, setRoles] = useState(defaultRoles);


    const handleSelectRole = (role) => {
        setEditRoleIndex(roles.indexOf(role));
        setOpenDialog(true);
    }

    const handleNameChange = (event) => {
        roles[editRoleIndex].name = event.target.value;
    }

    const handleChangeChecked = (event, roleIndex, permissionIndex) => {
        const updatedRoles = [...roles];
        updatedRoles[roleIndex].permissions[permissionIndex] = event.target.checked;
        setRoles(updatedRoles);
    }

    return (
        <div className={styles.table__container}>
            <h1 className={styles.table__title}>Permissions</h1>
            <table className={styles.table}>
            <thead>
                <tr>
                    <th className={styles.th}>Roles</th>
                    {permissions.map((permission, permIndex) => {return(
                        <th key={permIndex} className={styles.th}>{permission}</th>
                    );})}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Owner:</td>
                    {[...Array(permissions.length)].map((e, innerPermIndex) => { return(
                        <td key={innerPermIndex}>
                            <input disabled type="checkbox" value={true} checked={true} onChange={() => {}} />
                        </td>
                    );})}
                </tr>
                {roles.map((role, roleIndex) => {return(
                    <tr key={roleIndex}>
                        <td onClick={() => handleSelectRole(role)} className={styles.selectable_role}><Icon path={mdiPencil} size={0.8}></Icon> {role.name}:</td>
                        {[...Array(permissions.length)].map((e, innerPermIndex) => { return(
                            <td key={innerPermIndex}>
                                <input type="checkbox" value={roles[roleIndex].permissions[innerPermIndex]} checked={roles[roleIndex].permissions[innerPermIndex]} onChange={(event) => handleChangeChecked(event, roleIndex, innerPermIndex)} />
                            </td>
                        );})}
                    </tr>
                );})}
            </tbody>
            </table>
            <GButton icon={mdiPlus}>Create Role</GButton>
            <GDialog title="Edit Role" openDialog={openDialog} setOpenDialog={setOpenDialog}>
                <h1>Role Name</h1>
                <input type="text" value={roles[editRoleIndex].name} onChange={handleNameChange}/>
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
            </GDialog>
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
            </DangerDialog>
        </div>
    );
}