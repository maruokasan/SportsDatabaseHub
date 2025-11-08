const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password required')
  ],
  authController.login
);

module.exports = router;
