const User = require('../models/user');
const Level = require('../models/level');
const {validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');

exports.getIndex = (req,res, next) => {
    if(req.session.user){
        Level.findOne({number: req.user.level})
        .then(userLevel => {
            res.render('campus/index', {
                pageTitle : 'Home',
                path: '/',
                level: userLevel,
                user: req.user,
                errorMessage: ''
            });
        })
        .catch(err => {
            console.log(err);
        })
    } 
    else {
        res.render('campus/index', {
            pageTitle : 'Home',
            path: '/',
            errorMessage: ''
        });
    }
}

exports.getHelp = (req,res,next) => {
    res.render('campus/help', {
        pageTitle: 'Help',
        path: '/help'
    });
}

exports.getLevels = (req, res, next) => {
    if(req.session.user) {
        res.render('campus/levels', {
            pageTitle: 'Levels',
            path: '/levels',
            level: req.user.level
        });
    } else {
        res.render('campus/levels', {
            pageTitle: 'Levels',
            path: '/levels',
        });
    }
    
}

exports.getLevel = (req, res, next) => {
    const level = req.params.number;
    Level.findOne({number: level})
    .then(userLevel => {
        res.render('campus/level', {
            pageTitle: 'Catch the Image',
            path: 'CampusPreneur',
            level: userLevel,
            user: req.user,
            errorMessage: ''
        });
    })
    .catch(err => {
        console.log(err);
    });
    
}

exports.postCheck = (req, res, next) => {
    const answer = req.body.answer;
    const username = req.body.username;
    User.findOne({username: username})
    .then(user => {
        const userLevel = user.level;
        if(userLevel == 21) {
            return res.redirect('/');
        }
        Level.findOne({number: user.level})
        .then(level => {
            if(level.answer === answer) {
                user.level = userLevel + 1;
                user.time = Date.now();
                return user.save().then(result => {
                    res.redirect('/');
                });
            }
            return res.render('campus/index', {
                pageTitle : 'Home',
                path: '/',
                level: level,
                user: req.user,
                errorMessage: 'Wrong Answer!! Try Again'
            });
        })
        
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getLeaderboard = (req, res, next) => {
    User.find()
    .then(users => {
        res.render('campus/leaderboard', {
            pageTitle: 'Leaderboard',
            path: 'leaderboard',
            users: users
        });
    })
    .catch(err => {
        console.log(err);
    });
}