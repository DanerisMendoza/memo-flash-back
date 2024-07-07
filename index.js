const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const path = require('path');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    // origin: 'http://localhost:5173',
    origin: '*',
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
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
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
const deckController = require('./controllers/DeckController'); // Import deck controller
const cardController = require('./controllers/CardController'); // Import card controller

// user
router.post('/login', upload.none(), userController.login);
router.get('/users', verifyToken(0), userController.getUsers);
router.post('/users', upload.none(), userController.createUser);
router.get('/getUserById', upload.none(), userController.getUserById);
router.get('/getUserByToken', userController.getUserByToken);
router.delete('/users/:id', userController.deleteUser);
router.delete('/deleteAllUsers', userController.deleteAll);
router.put('/users/:id', upload.none(), userController.updateUser);
router.post('/uploadAvatar', upload.single('avatar'), (req, res) => {
    res.status(200).json({ message: 'File uploaded successfully' });
});

// deck
router.post('/createDeck', upload.none(), deckController.createDeck);
router.get('/getAllDeck', deckController.getAllDecks);
router.get('/getDeckByUserId/:id', deckController.getDeckByUserId);
router.delete('/deleteDeckById/:id', deckController.deleteDeckById);
router.delete('/deleteAllDecks', deckController.deleteAllDecks);

// card
router.post('/createCard', upload.none(), cardController.createCard);
router.get('/getAllCards', cardController.getAllCards);
router.get('/getCardsByDeckId/:id', cardController.getCardsByDeckId);
router.delete('/deleteCardById/:id', cardController.deleteCardById);
router.delete('/deleteAllCards/', cardController.deleteAllCards);


app.use('/api', router); // Mount the router under the /api prefix

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
