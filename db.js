const pg = require('pg');
const uuid = require('uuid');
const { Client } = pg;

const client = new Client('postgres://localhost/user_department_db');

client.connect();

//CRUD
const sync = async () => {
  const SQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments(
      id UUID PRIMARY KEY ,
      name VARCHAR NOT NULL ,
      CHECK (char_length(name) > 0)
    );
    ALTER TABLE departments ADD CONSTRAINT department_name UNIQUE(Name);
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      name VARCHAR NOT NULL,
      CHECK (char_length(name) > 0),
      "departmentId" UUID REFERENCES departments(id)
    );
    ALTER TABLE users ADD CONSTRAINT user_name UNIQUE(name);

    INSERT INTO departments (id, name) VALUES ('${uuid()}', 'Police');
    INSERT INTO departments (id, name) VALUES ('${uuid()}', 'Fullstack');

    INSERT INTO users (id, name) VALUES ('${uuid()}', 'Kelli');
    INSERT INTO users (id, name) VALUES ('${uuid()}', 'Chaise');
  `;

  await client.query(SQL);
};

//departments
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

const updateDepartment = async department => {
  const SQL = 'UPDATE departments set name=$1 WHERE id=$2 returning *';
  const response = await client.query(SQL, [department.name, department.id]);
  return response.rows[0];
};

const deleteDepartment = async id => {
  const SQL = 'DELETE FROM departments WHERE id=$1';
  await client.query(SQL, [id]);
};

//Users
const readUsers = async () => {
  const SQL = `SELECT * FROM users`;
  const response = await client.query(SQL);
  return response.rows;
};

//bonus validation function
const departmentIdCount = async departmentId => {
  if (!departmentId) {
    return 0;
  }
  const count =
    'SELECT "departmentId", COUNT ("departmentId") FROM users  WHERE "departmentId"=$1 GROUP BY "departmentId"';
  const response = await client.query(count, [departmentId]);
  if (response.rows.length === 0) {
    return 0;
  }
  return response.rows[0].count;
};

const createUser = async (name, departmentId) => {
  const dep_Id = await departmentIdCount(departmentId);

  if (dep_Id >= 5) {
    throw new Error('Cant add user, Department has more then five users');
  } else {
    const SQL = `INSERT INTO users (id, name, "departmentId") VALUES ($1, $2, $3) returning *`;
    const response = await client.query(SQL, [uuid(), name, departmentId]);
    return response.rows[0];
  }
};

const updateUser = async user => {
  const dep_Id = await departmentIdCount(user.departmentId);

  if (dep_Id >= 5) {
    throw new Error('Cant add user, Department has more then five users');
  } else {
    const SQL =
      'UPDATE users set name=$1, "departmentId"=$2 WHERE id=$3 returning *';
    const response = await client.query(SQL, [
      user.name,
      user.departmentId || null,
      user.id,
    ]);
    return response.rows[0];
  }
};

//another option to update user

// const updateUser = async user => {
// const SQL = `UPDATE users set ${
//   user.departmentId ? 'name=$1, "departmentId"=$2' : 'name=$1'
// } WHERE id=${user.departmentId ? '$3' : '$2'} returning *`;
// if (user.departmentId) {
//   const response = await client.query(SQL, [
//     user.name,
//     user.departmentId,
//     user.id,
//   ]);
//   return response.rows[0];
// } else {
//   const response = await client.query(SQL, [user.name, user.id]);
//   return response.rows[0];
// }
// };

const deleteUser = async id => {
  const SQL = 'DELETE FROM users WHERE id=$1';
  await client.query(SQL, [id]);
};

module.exports = {
  sync,
  readDepartments,
  readUsers,
  createDepartment,
  createUser,
  deleteDepartment,
  deleteUser,
  updateUser,
  updateDepartment,
};
