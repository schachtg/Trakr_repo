import React, { Fragment, useState } from 'react';
import { baseURL } from '../../apis/TicketManager';

export default function InputTicket () {

    const [description, setDescription] = useState("Hello");

    const onSubmitForm = async event => {
        event.preventDefault();
        try{ 
            const body = { description};
            const response = await fetch(`${baseURL}/tickets`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            window.location = "/";
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <Fragment>
            <h1 className="text-center mt-5">Input Ticket</h1>
            <form className="d-flex mt-5" onSubmit={onSubmitForm}>
                <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={event => setDescription(event.target.value)}
                />
                <button className="btn btn-success">Add</button>
            </form>
        </Fragment>
    );
}