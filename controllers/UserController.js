const knex = require('knex');
const knexConfig = require('../knexfile.js');
const db = knex(knexConfig.development);


exports.getUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('users.*', 'user_details.*')
      .join('user_details', 'users.id', 'user_details.user_id');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error });
  }
};

exports.createUser = (req, res) => {
  // Logic to create a new user in the database
};

exports.getUserById = (req, res) => {
  // Logic to fetch a user by ID from the database
};

exports.updateUser = (req, res) => {
  // Logic to update a user in the database
};

exports.deleteUser = (req, res) => {
  // Logic to delete a user from the database
};
