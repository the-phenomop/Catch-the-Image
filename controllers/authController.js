const User = require('../models/user');
const {validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign up',
        path: '/signup',
        errorMessage: '',
        oldInput: {
            email: '',
            username: ''
        },
        validationError: []
    })
}

exports.postSignup = (req,res,next) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.render('auth/signup', {
            pageTitle: 'Sign up',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                username: username
            },
            validationError: errors.array()
        });
    }
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
            level: 1,
            time: Date.now()
        });
        return user.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: "",
        oldInput: {
            username: ''
        },
        validationError: []
    });
}

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                username: username
            },
            validationError: errors.array()
        });
    }
    User.findOne({username: username})
    .then(user => {
        if(!user) {
            return res.render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid username or password',
                oldInput: {
                    username: username
                },
                validationError: []
            })
        }
        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save((err) => {
                    res.redirect('/');
                    console.log(err);
                });
            }

            return res.render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid username or password',
                oldInput: {
                    username: username
                },
                validationError: []
            });            
        })
        .catch(err => {
            console.log(err);
        });
        
    })
    .catch(err => {
        console.log(err);
    });
}

exports.postLogout = (req,res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getReset = (req,res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: '',
        oldInput: {
            username: ''
        },
        validationError: []
    });
}

exports.postReset = (req, res, next) => {
    const username = req.body.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render('auth/reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                username: username
            },
            validationError: errors.array()
        });
    }
    User.findOne({username: username})
    .then(user => {
        if(!user) {
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: "Invalid username or Password",
                oldInput: {
                    username: username
                },
                validationError: []
            });
        }
        bcrypt.compare(oldPassword, user.password)
        .then(doMatch => {
            if(doMatch) {
                if(newPassword !== confirmPassword) {
                    return res.render('auth/reset', {
                        pageTitle: 'Reset Password',
                        path: '/reset',
                        errorMessage: "Passwords have to match!!",
                        oldInput: {
                            username: username
                        },
                        validationError: []
                    });
                }
                return bcrypt.hash(newPassword, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.save().then(result => {
                        res.redirect('/');
                    });
                })
                .catch(err => {
                    console.log(err);
                });
            }
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: "Invalid username or Password",
                oldInput: {
                    username: username
                },
                validationError: []
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