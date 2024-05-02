const express = require('express');
const controller = require('../controllers/connectionsController');
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateId } = require('../middleware/validator');
const {fileUpload} = require('../middleware/fileUpload');
const { validateConnection, validateRsvp, validateResult } = require('../middleware/validator');

const router = express.Router();

//GET / - sends a list of connections
router.get('/', controller.getConnections);

//GET /newConnection - sends a form to add new connection
router.get('/newConnection', isLoggedIn, controller.getNewConnection);

//POST / - stores the new connection when submit is clicked
router.post('/', fileUpload, isLoggedIn, validateConnection, validateResult,controller.postNewConnection);

//GET /:id - sends the connection details as per id
router.get('/:id', validateId, controller.getConnectionDetail);

//GET /:id/edit - sends the update form
router.get('/:id/edit', validateId, isLoggedIn, isAuthor, controller.getEdit);

//PUT / - stores the updated connection as per the id
router.put('/:id', validateId, isLoggedIn,validateConnection, validateResult,fileUpload, isAuthor, controller.updateConnection);

router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.deleteConnection);

//POST /connections/:id/rsvp: user response to rsvp
router.post('/:id/rsvp', validateId, isLoggedIn,validateRsvp, controller.rsvp);

//DELETE /connections/rsvp/:id: delete the rsvp identified by id
router.delete('/rsvp/:id', validateId, isLoggedIn, controller.deleteRsvp);




module.exports = router;
