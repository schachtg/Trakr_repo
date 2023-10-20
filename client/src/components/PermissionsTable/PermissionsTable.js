import React, {useState} from 'react';
import styles from './PermissionsTable.module.css';
import { mdiPlus, mdiPencil, mdiDelete, mdiContentSave } from '@mdi/js';
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
    const [deleteDialog, setDeleteDialog] = useState(false);


    const handleSelectRole = (role) => {
        setEditRoleIndex(roles.indexOf(role));
        setOpenDialog(true);
    }

    const handleNameChange = (event) => {
        const updatedRoles = [...roles];
        updatedRoles[editRoleIndex].name = event.target.value;
        setRoles(updatedRoles);
    }

    const handleChangeChecked = (event, roleIndex, permissionIndex) => {
        const updatedRoles = [...roles];
        updatedRoles[roleIndex].permissions[permissionIndex] = event.target.checked;
        setRoles(updatedRoles);
    }

    const handleDeleteWarning = () => {
        setDeleteDialog(true);
    }

    const handleDeleteRole = () => {
        const updatedRoles = [...roles];
        updatedRoles.splice(editRoleIndex, 1);
        setRoles(updatedRoles);
        setDeleteDialog(false);
        setOpenDialog(false);
    }

    return (
        <div className={styles.table__container}>
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
            <GDialog fitContent title="Edit Role" openDialog={openDialog} setOpenDialog={setOpenDialog}>
                <div className={styles.role_input}>
                    <input type="text" value={roles[editRoleIndex].name} onChange={handleNameChange}/>
                </div>
                <div className={styles.button_row}>
                    <GButton
                        icon={mdiContentSave}
                        type="submit"
                    >
                        Save
                    </GButton>
                    <GButton
                        icon={mdiDelete}
                        onClick={handleDeleteWarning}
                        type="button"
                        warning
                    >
                        Delete
                    </GButton>
                </div>
            </GDialog>
            <DangerDialog
                title="Delete role"
                openDialog={deleteDialog}
                buttons={[
                    <GButton
                        onClick={() => setDeleteDialog(false)}
                        type="button"
                    >
                        Cancel
                    </GButton>,
                    <GButton
                        onClick={handleDeleteRole}
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