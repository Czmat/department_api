const pg = require('pg');
const uuid = require('uuid');
const { Client } = pg;

const client = new Client('postgres://localhost/user_department_db');

client.connect();

//CRUD
const sync = async () => {
  const SQL = `
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS departments;

    CREATE TABLE departments(
      id UUID PRIMARY KEY,
      name VARCHAR
    );

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      name VARCHAR,
      "departmentId" UUID REFERENCES departments(id)
    );

    INSERT INTO departments (id, name) VALUES (uuid(), 'Chaise');
    INSERT INTO departments (id, name) VALUES (uuid(), 'Kelly');
  `;
  await client.query(SQL);
  //DROP and RECREATE TABLES
  //remember "departmentId" will need to be in quotes
};

const readDepartments = async () => {
  return [];
};

const readUsers = async () => {
  return [];
};

module.exports = {
  sync,
  readDepartments,
  readUsers,
};
//you will eventually need to export all of these
/*
module.exports = {
  sync,
  readDepartments,
  readUsers,
  createDepartment,
  createUser,
  deleteDepartment,
  deleteUser,
  updateUser,
  updateDepartment
};
*/
