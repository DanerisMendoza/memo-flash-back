const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // if you are sending cookies or other credentials
}));
const multer = require('multer');
const upload = multer();

// Web (view)
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// middleware
const verifyToken = (role) => {
    return (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }
        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const hasPermission = decoded.role.includes(role)
            if (!hasPermission) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }            
            req.user = decoded;
            next();
        });
    };
};


// API 
const router = express.Router();
const userController = require('./controllers/UserController');
// user
router.post('/login', upload.none(), userController.login);
router.get('/users',verifyToken(0), userController.getUsers);
router.post('/users', upload.none(), userController.createUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.delete('/deleteAllUsers', userController.deleteAll);

app.use('/api', router); // Mount the router under the /api prefix


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
