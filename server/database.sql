CREATE DATABASE bugtrackerdb;

CREATE TABLE username_tickets(
    ticket_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255),
    epic VARCHAR(255),
    description VARCHAR(255),
    blocks VARCHAR(255)[],
    blocked_by VARCHAR(255)[],
    points DECIMAL(5,2),
    assignee VARCHAR(255),
    sprint VARCHAR(255),
    column_name VARCHAR(255),
    project VARCHAR(255)
);

CREATE TABLE user_info(
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    password VARCHAR(255)
);