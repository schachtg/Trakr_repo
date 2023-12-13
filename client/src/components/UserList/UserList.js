import React, {Fragment, useState, useEffect} from 'react';
import styles from './UserList.module.css';
import { mdiDelete, mdiPlus, mdiContentSave } from '@mdi/js';

// Components
import GButton from '../GButton/GButton';
import GDialog from '../GDialog/GDialog';
import DangerDialog from '../DangerDialog/DangerDialog';
import RowItem from '../RowItem/RowItem';

export default function UserList({project_id}) {
    const [users, setUsers] = useState([]);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const getUsersFromDB = async event => {
        try{
            const response = await fetch(`http://localhost:5000/projects/${project_id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
            });
            const data = await response.json();
            return data.user_emails;
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
            if (response.status === 200) {
                alert("User invited!");
                return;
            }
            alert("An error occurred.");
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getUsersFromDB()
            .then((data) => {
                setUsers(data);
            });
    }, []);

    return (
        <Fragment>
            <GButton icon={mdiPlus} onClick={() => setInviteDialogOpen(true)}>Add User</GButton>
            <GDialog fitContent title="Invite User" openDialog={inviteDialogOpen} setOpenDialog={setInviteDialogOpen}>
                <div className={styles.dialogContent}>
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" name="email" placeholder="Email" onChange={(event) => setInviteEmail(event.target.value)}/>
                    <GButton icon={mdiContentSave} onClick={() => addUser(inviteEmail)}>Invite</GButton>
                </div>
            </GDialog>
        </Fragment>
    );
}