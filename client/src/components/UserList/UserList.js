import React, {Fragment, useState, useEffect} from 'react';
import styles from './UserList.module.css';
import { mdiDelete, mdiPlus, mdiAccountPlus } from '@mdi/js';
import { hasPermission } from '../../HelperFunctions';

// Components
import GButton from '../GButton/GButton';
import GDialog from '../GDialog/GDialog';
import DangerDialog from '../DangerDialog/DangerDialog';
import RowItem from '../RowItem/RowItem';

export default function UserList({roles=[], setRoles, project_id}) {
    const [users, setUsers] = useState([]);
    const [currUser, setCurrUser] = useState({});
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [openRemoveWarning, setOpenRemoveWarning] = useState(false);
    const [removingUser, setRemovingUser] = useState(0);
    const [inviteEmail, setInviteEmail] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState("");

    const getUsersFromDB = async event => {
        try{
            const response = await fetch(`http://localhost:5000/user_info/project/${project_id}`, {
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

    const addUser = async (recipient_email) => {
        try{ 
            const body = {
                project_id: project_id,
                recipient_email,
            };
            const response = await fetch("http://localhost:5000/invite", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.status === 200) {
                alert(`${recipient_email} has been invited!`);
                return;
            }
            alert(data.message);
        } catch (err) {
            console.error(err.message);
        }
    }

    const removeUser = async (email) => {
        try{ 
            const body = {
                project_id: project_id,
                email,
            };
            const response = await fetch("http://localhost:5000/remove_user", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            if (response.status === 200) {
                window.location.reload();
                return;
            }
            alert("An error occurred.");
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleOpenInviteDialog = async () => {
        if (!await hasPermission("Invite users", project_id)) {
            alert("You do not have permission to invite users");
            return;
        }
        setInviteEmail("");
        setEmailErrorMessage("Must not be empty");
        setInviteDialogOpen(true);
    }

    const handleInviteUser = async (inviteEmail) => {
        addUser(inviteEmail);
        setInviteDialogOpen(false);
    }

    const handleSetInviteEmail = (event) => {
        const value = event.target.value;
        setInviteEmail(value);
        if (value.length >= 200) {
            setEmailErrorMessage("Must be less than 200 characters");
        } else if (value.length === 0) {
            setEmailErrorMessage("Must not be empty");
        } else if (value.includes("@") === false) {
            setEmailErrorMessage("Must be a valid email");
        } else if (users.filter((user) => user.email === value).length >= 1) {
            setEmailErrorMessage("Must be an email not in the project");
        } else {
            setEmailErrorMessage("");
        }
    }

    const handleChangeRole = async (email, role_name) => {
        const adminRole = roles.filter((role) => role.name === "Admin")[0];
        if (!await hasPermission("Edit roles", project_id)) {
            alert("You do not have permission to edit roles");
            return;
        }
        if (role_name !== "Admin"
            && adminRole.user_emails.includes(email)
            && adminRole.user_emails.length === 1
        ) {
            alert("You cannot remove the last admin");
            return;
        }
        try{ 
            const body = {
                project_id: project_id,
                email,
                role_name,
            };
            const response = await fetch("http://localhost:5000/change_role", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.status === 200) {
                setRoles(data);
                return;
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const getRole = (email) => {
        const role = roles.filter((role) => role.user_emails !== null && role.user_emails.includes(email))[0];
        if (role) {
            return role.name;
        }
        return "";
    }

    const getCurrUserData = async () => {
        const response = await fetch("http://localhost:5000/user_info", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        return await response.json();
    }

    const handleOpenRemoveWarning = async (email, index) => {
        if (email !== currUser.email) {
            if (!await hasPermission("Remove other users", project_id)) {
                alert("You do not have permission to remove other users");
                return;
            }
        }
        const adminRole = roles.filter((role) => role.name === "Admin")[0];
        if (adminRole.user_emails.includes(email)
            && adminRole.user_emails.length === 1
        ) {
            alert("You cannot remove the last admin");
            return;
        }
        setOpenRemoveWarning(true);
        setRemovingUser(index);
    }

    useEffect(() => {
        getUsersFromDB()
            .then((data) => {
                setUsers(data);
            });
        getCurrUserData()
            .then((data) => {
                setCurrUser(data);
            });
    }, []);

    return (
        <Fragment>
            <div className={styles.user_list}>
                {users.map((user, index) => (
                    <RowItem
                        key={index}
                        title={user.name}
                        subtitle={getRole(user.email)}
                        childRows={[
                            {
                                title: "Change Role",
                                childRows: roles.map((role, index) => ({
                                    title: role.name,
                                    onClick: () => {
                                        handleChangeRole(user.email, role.name);
                                    }
                                }))
                            },
                            {
                                title: "Remove User",
                                onClick: () => {
                                    handleOpenRemoveWarning(user.email, index)
                                }
                            },
                        ]}
                    />
                ))}
            </div>
            <GButton icon={mdiPlus} centered onClick={handleOpenInviteDialog}>Invite User</GButton>
            <GDialog fitContent title="Invite User" openDialog={inviteDialogOpen} setOpenDialog={setInviteDialogOpen}>
                <label htmlFor="email">Email:</label>
                <div className={styles.form_section}>
                    <input className={styles.dark_input} type="text" id="email" name="email" onChange={handleSetInviteEmail}/>
                    {emailErrorMessage && <div className={styles.error_message}>{emailErrorMessage}</div>}
                </div>
                <div className={styles.button_row}>
                    <GButton
                        onClick={() => setInviteDialogOpen(false)}
                        type="button"
                        warning
                        alternate
                    >
                        Cancel
                    </GButton>
                    <GButton
                        icon={mdiAccountPlus}
                        onClick={() => handleInviteUser(inviteEmail)}
                        disabled={emailErrorMessage.length > 0}
                    >
                        Invite
                    </GButton>
                </div>
            </GDialog>
            <DangerDialog
                title="Remove User"
                openDialog={openRemoveWarning}
                buttons={[
                    <GButton
                        onClick={() => setOpenRemoveWarning(false)}
                        type="button"
                    >
                        Cancel
                    </GButton>,
                    <GButton
                        icon={mdiDelete}
                        type="button"
                        onClick={() => removeUser(users[removingUser].email)}
                        warning
                    >
                        Remove
                    </GButton>
                ]}
            >
                {users.length > 0 && <span>
                    Are you sure you want to remove user {users[removingUser].name}?
                </span>}
            </DangerDialog>
        </Fragment>
    );
}