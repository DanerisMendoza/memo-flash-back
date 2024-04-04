const express = require('express');
const app = express();
app.use(express.json());

// Web (view)
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// API 
const router = express.Router();
const userController = require('./controllers/UserController');
// user
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

app.use('/api', router); // Mount the router under the /api prefix


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
