CREATE DATABASE bugtrackerdb;

CREATE TABLE ticket(
    ticket_id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);