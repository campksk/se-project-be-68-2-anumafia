const express = require('express');
const { register, login, getMe, logout, updatePassword,updateMe } = require('../controllers/auth');
const { protect }= require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect,getMe);
router.get('/logout',logout);
router.put('/updatepassword', protect, updatePassword);
router.put('/me',protect,updateMe);
module.exports = router;
