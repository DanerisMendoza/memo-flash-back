require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// mongoose.connect('mongodb://127.0.0.1:27017/crud')
mongoose.connect(mongoDatabaseURL)

const connection = mongoose.connection

const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  role: [Number], //0=> admin, 1=>enduser
  profile_pic_path: String,
})
const UserModel = mongoose.model("users", UserSchema)

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(password);

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Add return statement
    }

    bcrypt.compare(password, user.password)
      .then((isPasswordValid) => {
        if (isPasswordValid) {
          const token = jwt.sign({ id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, profile_pic_path: user.profile_pic_path }, 'your_secret_key');
          return res.json({ token, status: 200 }); // Add return statement
        }
        else {
          return res.status(401).json({ message: 'Invalid password' }); // Add return statement
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' }); // Add return statement
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' }); // Add return statement
  }
};




exports.getUsers = async (req, res) => {
  UserModel.find({}).then((result) => {
    return res.json(result)
  }).catch((err) => {
    console.log(err)
  })
};

exports.createUser = (req, res) => {
  const { username, name, password, role, email } = req.body;
  console.log(req.body)
  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server Error' });
    }

    UserModel.findOne({ $or: [{ username: username }, { email: email }] })
      .then(existingUser => {
        if (existingUser) {
          console.log(existingUser)
          if (existingUser.username === username) {
            return res.status(400).json({ message: 'Username already exists!' });
          } else if (existingUser.email === email) {
            return res.status(400).json({ message: 'Email already exists!' });
          }
        } else {
          // Create a new user with hashed password
          const newUser = new UserModel({
            name,
            username,
            email,
            password: hashedPassword,
            role,
            profile_pic_path: '',
          });
          newUser.save()
            .then(savedUser => {
              return res.status(201).json(savedUser);
            })
            .catch(error => {
              console.error(error);
              return res.status(500).json({ message: 'Server Error' });
            });
        }
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
      });

  });
};



exports.getUserById = (req, res) => {
  const userId = req.body.user_id;
  UserModel.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    });
};

exports.getUserByToken = (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: 'Token is not provided' });
  }
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.json(decoded);
  });
};

exports.uploadAvatar = async (req, res, next) => {
  console.log(req)
}

exports.updateUser = async (req, res, next) => {
  // console.log(req.body)
  const userId = req.params.id;
  const { name, username, email, avatar_name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!username) {
    return res.status(400).json({ message: 'username is required' });
  }

  try {
    // Check if name is already in use
    const existingNameUser = await UserModel.findOne({ name });
    if (existingNameUser && existingNameUser._id.toString() !== userId) {
      return res.status(409).json({ message: 'Name is already in use' });
    }

    // Check if email is already in use
    const existingEmailUser = await UserModel.findOne({ email });
    if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
      return res.status(409).json({ message: 'Email is already in use' });

    }

    // Check if username is already in use
    const existingUsernameUser = await UserModel.findOne({ username });
    if (existingUsernameUser && existingUsernameUser._id.toString() !== userId) {
      return res.status(409).json({ message: 'Username is already in use' });
    }


  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }

  const updateData = { name, username, email };
  if (avatar_name != '') {
    const today = new Date().toISOString().slice(0, 10);
    const hash = crypto.createHash('sha256').update(today).digest('hex');
    const newFilename = `${hash}_${avatar_name}`;
    updateData.profile_pic_path = newFilename;
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await UserModel.findOne({ username });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, profile_pic_path: user.profile_pic_path }, 'your_secret_key');
    return res.json({ token, status: 200,  profile_pic_path: user.profile_pic_path });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};


exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  UserModel.findByIdAndDelete(userId)
    .then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ message: 'User deleted successfully' });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    });
};

exports.deleteAll = (req, res) => {
  UserModel.deleteMany({})
    .then(deletedUsers => {
      if (deletedUsers.deletedCount === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
      return res.json({ message: 'All users deleted successfully' });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    });
};
