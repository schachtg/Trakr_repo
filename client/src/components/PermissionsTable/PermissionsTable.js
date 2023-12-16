import React, {Fragment, useState} from 'react';
import styles from './PermissionsTable.module.css';
import { mdiPlus, mdiPencil, mdiDelete, mdiContentSave } from '@mdi/js';
import Icon from '@mdi/react';

// COMPONENTS
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';
import DangerDialog from '../../components/DangerDialog/DangerDialog';

let defaultPermissions = [
    "Edit tickets",
    "Edit epics",
    "End sprint",
    "Edit columns",
    "Invite users",
    "Remove users",
    "Edit roles",
    "Delete project",
]

// let defaultRoles = [
//     {
//         id: 0,
//         name: "Role 1",
//         permissions: [
//             true,
//             true,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//         ],
//     },
//     {
//         id: 1,
//         name: "Role 2",
//         permissions: [
//             true,
//             false,
//             true,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//         ],
//     },
//     {
//         id: 2,
//         name: "Role 3",
//         permissions: [
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//             false,
//         ],
//     },
// ]

export default function PermissionsTable() {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editRoleIndex, setEditRoleIndex] = useState(0);
    const [permissions] = useState(defaultPermissions);
    const [roles, setRoles] = useState([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [createRoleDialog, setCreateRoleDialog] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleErrorMessage, setNewRoleErrorMessage] = useState("");


    const handleSelectRole = (role) => {
        setEditRoleIndex(roles.indexOf(role));
        setNewRoleName(role.name);
        setNewRoleErrorMessage("");
        setOpenEditDialog(true);
    }

    const handleSaveNewName = () => {
        const updatedRoles = [...roles];
        updatedRoles[editRoleIndex].name = newRoleName;
        setRoles(updatedRoles);
        setOpenEditDialog(false);
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
        setEditRoleIndex(0);
        setRoles(updatedRoles);
        setDeleteDialog(false);
        setOpenEditDialog(false);
    }

    const handleOpenCreateRole = async (inviteEmail) => {
        setNewRoleName("");
        setNewRoleErrorMessage("Must not be empty");
        setCreateRoleDialog(true);
    }

    const handleCreateRole = () => {
        const updatedRoles = [...roles];
        updatedRoles.push({
            name: newRoleName,
            permissions: [...Array(permissions.length)].map((e) => false),
        });
        setRoles(updatedRoles);
        setCreateRoleDialog(false);
    }

    const handleSetNewRoleName = (event) => {
        const value = event.target.value;
        setNewRoleName(value);
        if (value.length >= 30) {
            setNewRoleErrorMessage("Must be less than 30 characters");
        } else if (value.length === 0) {
            setNewRoleErrorMessage("Must not be empty");
        } else if (roles.filter((role) => role.name === value).length >= 1) {
            setNewRoleErrorMessage("Must be unique");
        } else {
            setNewRoleErrorMessage("");
        }
    }

    return (
        <Fragment>
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
                        <td>Admin:</td>
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
                <GDialog fitContent title="Edit Role" openDialog={openEditDialog} setOpenDialog={setOpenEditDialog}>
                    <label htmlFor="editName">Name:</label>
                    {roles.length > 0 && <div className={styles.form_section}>
                        <input className={styles.dark_input} type="text" id="editName" name="editName" value={newRoleName} onChange={handleSetNewRoleName}/>
                        {newRoleErrorMessage && <div className={styles.error_message}>{newRoleErrorMessage}</div>}
                    </div>}
                    <div className={styles.button_row}>
                        <GButton
                            icon={mdiContentSave}
                            type="submit"
                            onClick={handleSaveNewName}
                            disabled={newRoleErrorMessage.length > 0}
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
                {roles.length > 0 && <DangerDialog
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
                    Are you sure you want to delete the role {roles[editRoleIndex].name}?
                </DangerDialog>}
            </div>
            <GButton centered icon={mdiPlus} onClick={handleOpenCreateRole}>Create Role</GButton>
            <GDialog fitContent title="Create Role" openDialog={createRoleDialog} setOpenDialog={setCreateRoleDialog}>
                <label htmlFor="name">Name:</label>
                <div className={styles.form_section}>
                    <input className={styles.dark_input} type="text" id="name" name="name" onChange={handleSetNewRoleName}/>
                    {newRoleErrorMessage && <div className={styles.error_message}>{newRoleErrorMessage}</div>}
                </div>
                <div className={styles.button_row}>
                    <GButton
                        onClick={() => setCreateRoleDialog(false)}
                        type="button"
                        warning
                        alternate
                    >
                        Cancel
                    </GButton>
                    <GButton
                        icon={mdiContentSave}
                        onClick={handleCreateRole}
                        disabled={newRoleErrorMessage.length > 0}
                    >
                        Save
                    </GButton>
                </div>
            </GDialog>
        </Fragment>
    );
}