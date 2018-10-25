'use strict';
const express = require('express')
    , mongoose = require('mongoose')
    , validator = require('express-validator')
    , http = require('http')
    , bodyParser = require('body-parser')
    , path = require('path')
    , CONFIG = require('./config/config')
    , fs = require('fs')
    , router = express.Router();


const app = express();

/*----------- mongodb connection */
mongoose.connect(CONFIG.DB_URL, { useNewUrlParser: true }).then(() => {
    console.log('MongoDB connected')
}).catch((err) => {
    console.log('MongoDB err ', err);
});
/*----------------------------------------*/

/*----- middleware configuration ----*/

app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))// parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '100mb'})) // parse application/json

app.use(validator());
app.use('/app', express.static(path.join(__dirname, '/app'), {maxAge: 7 * 86400000})); // 1 day = 86400000 ms
app.set('view engine', 'pug');
app.set('views', './views');
app.use(function (req, res, next) {
    // console.log('original url = ',req.originalUrl)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/*------------------------------------*/

/* dependency mapping*/
require('./routes/site')(app);
/******************/
app.get('/*', function (req, res) {
    res.sendFile(path.resolve(path.normalize(__dirname, '') + '/views/index.html'));
});


/*--------- Server listen ----------------*/
const server = http.createServer(app);
try {
    server.listen(CONFIG.port, () => {
        console.log(`Server connected port with ${CONFIG.port}`)
    });
} catch (e) {
    console.log(e)
}
/*----------------------------------------*/
