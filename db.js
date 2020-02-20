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
      "departmentId" UUID REFERENCES departments(id) DEFAULT NULL
    );

    INSERT INTO departments (id, name) VALUES ('${uuid()}', 'Police');
    INSERT INTO departments (id, name) VALUES ('${uuid()}', 'Fullstack');

    INSERT INTO users (id, name) VALUES ('${uuid()}', 'Kelli');
    INSERT INTO users (id, name) VALUES ('${uuid()}', 'Chaise');

  `;

  await client.query(SQL);
};

const readDepartments = async () => {
  const SQL = `SELECT * FROM departments`;
  const response = await client.query(SQL);
  return response.rows;
};

const createDepartment = async name => {
  const SQL = `INSERT INTO departments (id, name) VALUES ($1, $2) returning *`;
  const response = await client.query(SQL, [uuid(), name]);
  return response.rows[0];
};

const readUsers = async () => {
  const SQL = `SELECT * FROM users`;
  const response = await client.query(SQL);
  return response.rows;
};

const createUser = async (name, departmentId) => {
  const SQL = `INSERT INTO users (id, name, "departmentId") VALUES ($1, $2, $3) returning *`;
  const response = await client.query(SQL, [uuid(), name, departmentId]);
  return response.rows[0];
};

// module.exports = {
//   sync,
//   readDepartments,
//   readUsers,
// };
//you will eventually need to export all of these

module.exports = {
  sync,
  readDepartments,
  readUsers,
  createDepartment,
  createUser,
  // deleteDepartment,
  // deleteUser,
  // updateUser,
  // updateDepartment
};
