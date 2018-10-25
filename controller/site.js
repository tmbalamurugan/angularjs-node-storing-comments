"use strict"
const db = require('../controller/common/query')
    , bcrypt = require('bcrypt')
    , jwt = require('jsonwebtoken')
    , CONFIG = require('../config/config')
    , mongoose = require('mongoose');
module.exports = (app) => {
    const router = {};
    router.login = async (req, res) => {
        let data = req.body;
        try {
            let token = jwt.sign({id: req.body.name}, CONFIG.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            const getUser = await db.GetOneDocument('users', {"name": req.body.name}, {});
            let match = await bcrypt.compareSync(req.body.password, getUser.password);
            if (match && data.name === getUser.name) {
                res.send({'status': 1, 'msg': "Successfully Login", 'data': getUser, 'token': token})
            } else {
                res.send({'status': 0, 'msg': 'Invalid User'});
            }
        } catch (e) {
            console.log('--- ', e)
            res.send({'status': 0, 'msg': "Already Name Exist"});
        }
    }

    router.signup = async (req, res) => {
        try {
            let password = bcrypt.hashSync(req.body.password, 8);
            let token = jwt.sign({id: req.body.name}, CONFIG.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            req.body.password = password;
            req.body.token = token;
            let signup = await db.InsertDocument('users', req.body);
            res.send({'status': 1, 'msg': "Successfully signup", 'data': signup});
        } catch (e) {
            if (e.code === 11000) return res.send({'status': 0, 'msg': "Name Already Exist"});
            res.send({'status': 0, 'msg': 'Unable to save'});
        }
    }
    return router;
}