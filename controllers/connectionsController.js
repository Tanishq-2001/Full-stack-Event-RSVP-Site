const model = require('../models/connectionsData');

const { DateTime } = require('luxon');
const User = require('../models/user');
const Rsvp = require('../models/rsvp');
const Connection = require('../models/connectionsData'); 

// callback function for landing page
exports.index = (req, res, next) => {
    const user = req.session.user;
    User.findById(user)
        .then(user => {
            res.render('index', { user });
        })
        .catch(err => next(err));
};

// callback function for about page
exports.about = (req, res, next) => {
    const user = req.session.user;
    User.findById(user)
        .then(user => {
            res.render('about', { user });
        })
        .catch(err => next(err));
};

// callback function for contact page
exports.contact = (req, res, next) => {
    const user = req.session.user;
    User.findById(user)
        .then(user => {
            res.render('contact', { user });
        })
        .catch(err => next(err));
};

// callback function to GET the connections page
exports.getConnections = (req, res, next) => {
    Promise.all([Connection.find(), User.findById(req.session.user)])
        .then((results) => {
            const [connections, user] = results;
            const categories = [];
            connections.forEach(connection => {
                if (!categories.includes(connection.category)) {
                    categories.push(connection.category);
                }
            });
            res.render('./connections/connections', { connections, categories, user });
        })
        .catch(err => next(err));
};

// callback function to GET the newConnections page
exports.getNewConnection = (req, res, next) => {
    const user = req.session.user;
    User.findById(user)
        .then(user => {
            res.render('./connections/newConnection', { user });
        })
        .catch(err => next(err));
};

// callback function to POST the newConnection 
exports.postNewConnection = (req, res, next) => {
    let today = new Date();
    const connectionData = new model(req.body);
    connectionData.hostedBy = req.session.user;

    // Check if req.file exists
    if (req.file) {
        connectionData.image = "/image/" + req.file.filename;
    } else {
        // If req.file doesn't exist, handle the error
        req.flash('error', 'Image upload is required');
        return res.redirect('back');
    }

    let date = new Date(req.body.date);

    if (date.getTime() < today.getTime()) {
        req.flash('error', 'Selected date must be greater than today\'s');
        return res.redirect('back');
    }

    connectionData.save()
        .then(connection => {
            req.flash('success', 'Event made successfully');
            res.redirect('/connections');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('back'); // Redirect to previous page
            }
            next(err);
        });
};


// connectionsController.js

exports.getConnectionDetail = (req, res, next) => {
    const id = req.params.id;
    const user = req.session.user;

    Promise.all([model.findById(id).populate('hostedBy', 'firstName lastName'), User.findById(user)])
        .then(([connection, user]) => {
            
            if (connection) {
                Rsvp.countDocuments({ status: 'Yes', connection: id })
                    .then(rsvpCount => {
                        return res.render('./connections/connection', { connection, user, rsvpCount });
                    })
                    .catch(err => next(err));
            } else {
                let err = new Error('Cannot find a connection with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};


// Ensure other controller functions are also correctly implemented and exported

// callback function to GET the update connection page
exports.getEdit = (req, res, next) => {
    const id = req.params.id;
    const user = req.session.user;
    User.findById(user)
        .then(user => {
            if (!user) {
                throw new Error('User not found');
            }
            model.findById(id).lean()
                .then(connection => {
                    if (!connection) {
                        const err = new Error('Cannot find connection with id ' + id);
                        err.status = 404;
                        return next(err);
                    }
                    const startDateTime = DateTime.fromJSDate(connection.startDateTime);
                    connection.startDateTime = startDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm');
                    const endDateTime = DateTime.fromJSDate(connection.endDateTime);
                    connection.endDateTime = endDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm');
                    res.render('./connections/edit', { connection, user });
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.updateConnection = (req, res, next) => {
    const connectionData = req.body;
    const id = req.params.id;
    model.findByIdAndUpdate(id, connectionData, { useFindAndModify: false, runValidators: true })
        .then(connection => {
            if (connection) {
                req.flash('success', 'Event has been updated successfully');
                return res.redirect('/connections/' + id);
            } else {
                const err = new Error('Cannot find connection with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            next(err);
        });
};

// callback function to DELETE the connection
exports.deleteConnection = (req, res, next) => {
    const id = req.params.id;
    // Delete all RSVPs associated with the connection
    Rsvp.deleteMany({ connection: id })
        .then(() => {
            // After deleting RSVPs, delete the connection
            return model.findByIdAndDelete(id);
        })
        .then(connection => {
            if (connection) {
                req.flash('success', 'Event and associated RSVPs deleted successfully');
                res.redirect('/users/profile');
            } else {
                const err = new Error('Cannot find connection with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.rsvp = (req, res, next) => {
    let attendees = req.session.user;
    let id = req.params.id;
    let status = req.body.status;

    // Ensure the status is not empty
    if (!status) {
        req.flash('error', 'RSVP status cannot be empty');
        return res.redirect('back');
    }

    // Ensure the status is valid
    if (!['Yes', 'Maybe', 'No'].includes(status)) {
        req.flash('error', 'RSVP status can only be Yes, No, or Maybe');
        return res.redirect('back');
    }

    Connection.findById(id)
        .then(connection => {
            if (connection) {
                if (connection.hostedBy == attendees) {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                return next(err);
                } else {
                    Rsvp.updateOne({ connection: id, attendees: attendees },
                        { $set: { connection: id, attendees: attendees, status: status } },
                        { upsert: true })
                        .then(rsvp => {
                            if (rsvp) {
                                if (rsvp.upserted) {
                                    req.flash('success', 'Successfully created an RSVP for this connection!');
                                    return res.redirect('/users/profile');
                                } else {
                                    req.flash('success', 'Successfully updated an RSVP for this connection!');
                                    return res.redirect('/users/profile');
                                }
                                res.redirect('/users/profile');
                            } else {
                                req.flash('There is some problem in creating an RSVP for this connection');
                                res.redirect('back');
                            }
                        })
                        .catch(err => {
                            if (err.name === 'ValidationError') {
                                req.flash('error', err.message);
                                res.redirect('back');
                            } else {
                                next(err);
                            }
                        });
                }
            } else {
                let err = new Error('Cannot find a connection with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.deleteRsvp = (req, res, next) => {
    let id = req.params.id;
    Rsvp.findByIdAndDelete(id, {useFindAndModify: false})
    .then(rsvp =>{
        if(rsvp) {
            req.flash('success', 'RSVP has been sucessfully deleted!');
            res.redirect('/users/profile');
        } else {
            let err = new Error('Cannot find an RSVP with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};