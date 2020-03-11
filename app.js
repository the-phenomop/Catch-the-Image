const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const routes = require('./routes/routes');
const errorController = require('./controllers/errorController');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://pulkit-1234:qhqImfwGvErqGDhq@cluster0-vkrrg.mongodb.net/campus?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret is here!!', 
        resave: false, 
        saveUninitialized: false,
        store:  store
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
        req.user = user;
        next();
        })
        .catch(err => console.log(err));
});

app.use((req,res,next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.use(routes);
app.use(errorController.get404);

mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
    .then(result => {
        app.listen(2000);
    })
    .catch(err => {
        console.log(err);
    })