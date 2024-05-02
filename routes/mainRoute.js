const express = require('express');
const controller = require('../controllers/connectionsController');

const router = express.Router();

// route to get landing page
router.get('/', controller.index);

//route to get /about page 
router.get('/about', controller.about);

//route to get /contact page 
router.get('/contact', controller.contact);

module.exports = router;