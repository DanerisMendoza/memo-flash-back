const knex = require('knex');
const knexConfig = require('../knexfile.js');
const db = knex(knexConfig.development);
const fs = require('fs');
const path = require('path');

exports.getUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('users.*', 'user_details.*')
      .join('user_details', 'users.id', 'user_details.user_id');

    // Function to convert image to base64
    function getImageBase64(profilePicPath) {
      if (profilePicPath !== null) {
        const imageType = path.extname(profilePicPath).substring(1); // Get the file extension
        const allowedFormats = ['png', 'jpg', 'jpeg']; // Allowed image formats

        if (allowedFormats.includes(imageType)) {
          try {
            const imageData = fs.readFileSync(profilePicPath); // Read image file
            const base64Image = Buffer.from(imageData).toString('base64'); // Convert image to base64
            return `data:image/${imageType};base64,${base64Image}`; // Format base64 image
          } catch (error) {
            console.error(`Error reading image ${profilePicPath}:`, error);
          }
        }
      }
      return null; // Return null if profile pic is null or unsupported format
    }

    // Map users array and add base64 image to each user object
    const usersWithImages = users.map(user => {
      const profilePicPath = user.profile_pic_path;
      const base64Image = getImageBase64(profilePicPath);
      return { ...user, base64img: base64Image };
    });

    res.json(usersWithImages);
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
