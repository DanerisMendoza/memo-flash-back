require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;


// mongoose.connect('mongodb://127.0.0.1:27017/crud')
mongoose.connect(mongoDatabaseURL, {
  useNewUrlParser: true,
})

const connection = mongoose.connection

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
})
const UserModel = mongoose.model("users", UserSchema)

exports.getUsers = async (req, res) => {
  UserModel.find({}).then((result) => {
    res.json(result)
  }).catch((err) => {
    console.log(err)
  })
};

exports.createUser = (req, res) => {
  const { name, email, password } = req.body;
  UserModel.findOne({ email: email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        const newUser = new UserModel({
          name,
          password,
          email,
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
