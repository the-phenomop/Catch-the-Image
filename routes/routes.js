const express = require('express');
const User = require('../models/user');

const router = express.Router();
const controller = require('../controllers/controller');
const authController = require('../controllers/authController');

const {check,body} = require('express-validator/check');

router.get('/', controller.getIndex);

router.get('/help', controller.getHelp);

router.get('/levels', controller.getLevels);

router.get('/levels/:number', controller.getLevel);

router.get('/leaderboard', controller.getLeaderboard);

router.post('/checkAnswer', controller.postCheck);

router.get('/signup', authController.getSignup);

router.get('/login', authController.getLogin);

router.post('/signup',
    [
        check('username').custom((value, {req}) => {
            return User.findOne({username: value})
            .then(userDoc => {
                if(userDoc) {
                    return Promise.reject('Username already taken. Pick a different one');
                }
            })
        }),
        check('email').isEmail().withMessage("Please enter a valid e-mail!")
        .custom((value, {req}) => {
            return User.findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-mail already exists!! Please pick a different one.');
                }
            });
        })
        .normalizeEmail(),
        body('password', 'Password length must contain atleast 6 characters.').isLength({min: 6}).trim(),
        body('confirmPassword').trim().custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error("Passwords must match!");
            }
            return true;
        })
    ], authController.postSignup);

router.post('/login',
    [
        body('password', 'Password length must contain atleast 6 characters.')
        .isLength({ min: 6 })
        .trim()
    ], authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset',
    [
        body('newPassword', 'Password length must contain atleast 6 characters.').isLength({min: 6}).trim(),
        body('oldPassword', 'Password length must contain atleast 6 characters.').isLength({min: 6}).trim(),
        body('confirmPassword', 'Password length must contain atleast 6 characters.').isLength({min: 6}).trim()
    ], authController.postReset);

module.exports = router;