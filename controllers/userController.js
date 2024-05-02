const model = require('../models/user');
const connection = require('../models/connectionsData');
const Rsvp = require('../models/rsvp');

// GET /users/new: get Sign Up form 
exports.new = (req, res) => {
    res.render('./user/new');
};

//POST /users/new: save the sign up details in DB
exports.create = (req, res, next)=> {
    let user = new model(req.body);
    user.save()
    .then(user=> {
        req.flash('success','Successfully registered!')
        res.redirect('/users/login');
    })
    .catch(err=> {
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('back');
        }
        next(err);
    });
};

//GET /users/login: get the login page
exports.getUserLogin =  (req, res) => {
    res.render('./user/login');
};

exports.login =  (req, res, next)=> {
    let email = req.body.email;
    let password = req.body.password;

    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{

                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/');
                }
                
                else {
                    
                    req.flash('error', 'Wrong password');      
                    res.redirect('/users/login');
                }
            });     
        }     
    })
    .catch(err=> next(err));
};

// exports.profile = (req, res, next)=>{
//     let id = req.session.user;
//     const user = req.session.user;
//     Promise.all([model.findById(id), Connection.find({hostedBy: id}), Rsvp.find({attendees: id}).populate('connection')]) 
//     .then(results=>{
//         const [user, connections, rsvps] = results;
//         res.render('./user/profile', {user, connections, rsvps})
//     })
//     .catch(err=>next(err));
// };
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



exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };







exports.profile = (req, res, next) => {
    const userId = req.session.user;

    model.findById(userId)
        .then(user => {
            if (!user) {
                // Handle the case where user is not found
                return res.status(404).send('User not found');
            }
            // Find user's RSVPs and connections
            Promise.all([
                Rsvp.find({ attendees: userId }).populate('connection'),
                connection.find({ hostedBy: userId })
            ])
                .then(([userRsvps, userConnections]) => {
                    res.render('./user/profile', { user: user, rsvps: userRsvps, connections: userConnections });
                })
                .catch(err => {
                    next(err);
                });
        })
        .catch(err => {
            next(err);
        });
};
