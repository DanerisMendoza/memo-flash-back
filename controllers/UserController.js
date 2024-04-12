require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// mongoose.connect('mongodb://127.0.0.1:27017/crud')
mongoose.connect(mongoDatabaseURL, {
  useNewUrlParser: true,
})

const connection = mongoose.connection

const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  role: [Number], //0=> admin, 1=>enduser
})
const UserModel = mongoose.model("users", UserSchema)

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid password' });
    }
    if(isPasswordValid){
      const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
      res.json({ token, status: 201 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getUsers = async (req, res) => {
  UserModel.find({}).then((result) => {
    res.json(result)
  }).catch((err) => {
    console.log(err)
  })
};

exports.createUser = (req, res) => {
  const { username, name, password,role } = req.body;
  console.log(req.body);

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server Error' });
    }

    UserModel.findOne({ username: username })
      .then(existingUsernameUser => {
        if (existingUsernameUser) {
          return res.status(400).json({ message: 'Username already exists!' });
        } else {
          // Create a new user with hashed password
          const newUser = new UserModel({
            username,
            name,
            password: hashedPassword, // Store hashed password
            role
          });
          newUser.save()
            .then(savedUser => {
              res.status(201).json(savedUser);
            })
            .catch(error => {
              console.error(error);
              res.status(500).json({ message: 'Server Error' });
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      });
  });
};



exports.getUserById = (req, res) => {
  const userId = req.params.id;
  UserModel.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ messpassword: 'User not found' });
      }
      res.json(user);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ messpassword: 'Server Error' });
    });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, password, email } = req.body;
  UserModel.findByIdAndUpdate(userId, { name, password, email }, { new: true })
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).json({ messpassword: 'User not found' });
      }
      res.json(updatedUser);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ messpassword: 'Server Error' });
    });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  UserModel.findByIdAndDelete(userId)
    .then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).json({ messpassword: 'User not found' });
      }
      res.json({ messpassword: 'User deleted successfully' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ messpassword: 'Server Error' });
    });
};

exports.deleteAll = (req, res) => {
  UserModel.deleteMany({})
    .then(deletedUsers => {
      if (deletedUsers.deletedCount === 0) {
        return res.status(404).json({ messpassword: 'No users found' });
      }
      res.json({ messpassword: 'All users deleted successfully' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ messpassword: 'Server Error' });
    });
};
