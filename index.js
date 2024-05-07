const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult, body } = require('express-validator');
const path = require('path');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // if you are sending cookies or other credentials
}));

const multer = require('multer');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only! (jpeg, jpg, png, gif)');
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set your desired upload directory
    },
    filename: function (req, file, cb) {
        const today = new Date().toISOString().slice(0, 10);
        const hash = crypto.createHash('sha256').update(today).digest('hex');
        const newFilename = `${hash}_${file.originalname}`;
        cb(null, newFilename);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

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
            if (role !== null) {
                const hasPermission = decoded.role.includes(role)
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
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
router.get('/users', verifyToken(0), userController.getUsers);
router.post('/users', upload.none(), userController.createUser);
router.get('/getUserById', upload.none(), userController.getUserById);
router.get('/getUserByToken', userController.getUserByToken);
router.put('/users/:id', upload.single('picture'), userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.delete('/deleteAllUsers', userController.deleteAll);

app.use('/api', router); // Mount the router under the /api prefix


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
