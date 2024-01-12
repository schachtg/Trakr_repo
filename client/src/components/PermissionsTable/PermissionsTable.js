import React, {Fragment, useState, useEffect} from 'react';
import styles from './PermissionsTable.module.css';
import { mdiPlus, mdiPencil, mdiDelete, mdiContentSave } from '@mdi/js';
import Icon from '@mdi/react';
import { PERMISSION_LIST } from '../../Constants';
import { hasPermission } from '../../HelperFunctions';

// COMPONENTS
import GButton from '../../components/GButton/GButton';
import GDialog from '../../components/GDialog/GDialog';
import DangerDialog from '../../components/DangerDialog/DangerDialog';

export default function PermissionsTable({roles, setRoles, project_id}) {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editRoleIndex, setEditRoleIndex] = useState(0);
    const [disablePermissionInputs, setDisablePermissionInputs] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [createRoleDialog, setCreateRoleDialog] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleErrorMessage, setNewRoleErrorMessage] = useState("");


    const handleSelectRole = async (role) => {
        if (!await hasPermission("Edit roles", project_id)) {
            alert("You do not have permission to edit roles");
            return;
        }
        setEditRoleIndex(roles.indexOf(role));
        setNewRoleName(role.name);
        setNewRoleErrorMessage("");
        setOpenEditDialog(true);
    }

    const handleSaveNewName = async () => {
        const updatedRoles = [...roles];
        updatedRoles[editRoleIndex].name = newRoleName;
        const response = await fetch("http://localhost:5000/roles", {
            method : "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
                role_id: updatedRoles[editRoleIndex].role_id,
                project_id: project_id,
                name: newRoleName,
                permissions: updatedRoles[editRoleIndex].permissions,
                user_emails: updatedRoles[editRoleIndex].user_emails
            })
        });
        if (!response.ok) {
            alert("Error updating role name");
            window.location.reload();
            return;
        }
        setRoles(updatedRoles);
        setOpenEditDialog(false);
        return;
    }

    const handleChangeChecked = async (event, roleIndex, permissionIndex) => {
        const updatedRoles = [...roles];
        updatedRoles[roleIndex].permissions[permissionIndex] = event.target.checked;
        setRoles(updatedRoles);
        await fetch("http://localhost:5000/roles", {
            method : "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
                role_id: updatedRoles[roleIndex].role_id,
                project_id: project_id,
                name: updatedRoles[roleIndex].name,
                permissions: updatedRoles[roleIndex].permissions,
                user_emails: updatedRoles[roleIndex].user_emails
            })
        });
    }

    const handleDeleteWarning = () => {
        setDeleteDialog(true);
    }

    const handleDeleteRole = async () => {
        const updatedRoles = [...roles];
        const deletingRoleUserList = updatedRoles[editRoleIndex].user_emails;
        const defaultIndex = updatedRoles.findIndex((role) => role.name === "Default");
        updatedRoles[defaultIndex].user_emails = [...updatedRoles[defaultIndex].user_emails, ...deletingRoleUserList];
        updatedRoles.splice(editRoleIndex, 1);
        const response = await fetch("http://localhost:5000/roles", {
            method : "DELETE",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
                role_id: roles[editRoleIndex].role_id,
                project_id: project_id,
            })
        });
        if (!response.ok) {
            alert("Error deleting role");
            window.location.reload();
            return;
        }
        setEditRoleIndex(0);
        setRoles(updatedRoles);
        setDeleteDialog(false);
        setOpenEditDialog(false);
        return;
    }

    const handleOpenCreateRole = async () => {
        if (!await hasPermission("Edit roles", project_id)) {
            alert("You do not have permission to edit roles");
            return;
        }
        setNewRoleName("");
        setNewRoleErrorMessage("Must not be empty");
        setCreateRoleDialog(true);
    }

    const handleCreateRole = async () => {
        const updatedRoles = [...roles];
        const newRole = {
            name: newRoleName,
            permissions: [...Array(PERMISSION_LIST.length)].map((e) => false),
            user_emails: []
        };
        updatedRoles.push(newRole);
        const response = await fetch("http://localhost:5000/roles", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({roles: [newRole], project_id: project_id })
        });
        if (!response.ok) {
            alert("Error creating role");
            window.location.reload();
            return;
        }
        setRoles(updatedRoles);
        setCreateRoleDialog(false);
        window.location.reload();
        return;
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

    const getRolesFromDB = async () => {
        try{
            const response = await fetch(`http://localhost:5000/roles/${project_id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err.message);
        }
    }

    const checkPermissionInputs = async () => {
        const hasEditRoles = await hasPermission("Edit roles", project_id);
        return hasEditRoles;
    }

    useEffect(() => {
        getRolesFromDB()
            .then((data) => {
                setRoles(data);
            });
        checkPermissionInputs()
            .then((result) => {
                setDisablePermissionInputs(!result);
            });
    }, []);

    return (
        <Fragment>
            <div className={styles.table__container}>
                <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Roles</th>
                        {PERMISSION_LIST.map((permission, permIndex) => {return(
                            <th key={permIndex} className={styles.th}>{permission}</th>
                        );})}
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role, roleIndex) => {return(
                        <tr key={roleIndex}>
                            <td
                                onClick={role.name === "Admin" || role.name === "Default" ? () => {} : () => handleSelectRole(role)}
                                className={role.name === "Admin" || role.name === "Default" ? styles.unselectable_role : styles.selectable_role}
                            >
                                    {(role.name !== "Admin" && role.name !== "Default") && <Icon path={mdiPencil} size={0.8}></Icon>}
                                    {role.name}:
                            </td>
                            {[...Array(PERMISSION_LIST.length)].map((e, permIndex) => { return(
                                <td key={permIndex}>
                                    <input
                                        disabled={role.name === "Admin" || disablePermissionInputs}
                                        type="checkbox"
                                        value={roles[roleIndex].permissions[permIndex]}
                                        checked={roles[roleIndex].permissions[permIndex]}
                                        onChange={async (event) => handleChangeChecked(event, roleIndex, permIndex)}
                                    />
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