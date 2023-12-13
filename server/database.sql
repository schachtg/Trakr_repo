CREATE DATABASE bugtrackerdb;

CREATE TABLE projects(
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    curr_sprint INT,
    user_emails VARCHAR(255)[]
);

CREATE TABLE tickets(
    ticket_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255),
    epic VARCHAR(255),
    description VARCHAR(255),
    blocks VARCHAR(255)[],
    blocked_by VARCHAR(255)[],
    points DECIMAL(5,1),
    assignee VARCHAR(255),
    sprint VARCHAR(255),
    column_name VARCHAR(255),
    pull_request VARCHAR(255),
    project_id INT REFERENCES projects(project_id),
    username VARCHAR(255)
);

CREATE TABLE user_info(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    token VARCHAR(255),
    password VARCHAR(255),
    open_project INT REFERENCES projects(project_id)
);

CREATE TABLE cols(
    col_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id),
    name VARCHAR(255) NOT NULL,
    size INT,
    max INT,
    next_col INT
);

CREATE TABLE roles(
    role_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id),
    name VARCHAR(255) NOT NULL,
    permissions BOOLEAN[]
);

-- Set up public user
INSERT INTO user_info (email, name, password) VALUES ('PublicDemo', 'Public User', '');

-- Clear tables from db
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS user_info CASCADE;
DROP TABLE IF EXISTS cols CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
