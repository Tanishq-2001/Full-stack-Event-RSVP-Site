const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { DateTime } = require('luxon');
const Rsvp = require('../models/rsvp');

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    // an objectId is a 24-bit Hex string
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignUp = [
    body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email must be valid').isEmail().normalizeEmail().trim().escape(),
    body('password', 'Password must be between 8 and 64 characters').isLength({ min: 8, max: 64 })
];

exports.validateLogIn = [
    body('email', 'Email must be valid').trim().isEmail().normalizeEmail(),
    body('password', 'Password must be between 8 and 64 characters').isLength({ min: 8, max: 64 })
];

exports.validateConnection = [
    body('title', 'Title cannot be empty').notEmpty().trim().escape(),
    body('category')
        .notEmpty().withMessage('Category must be selected')
        .isIn(['Committee Events', 'Group Events', 'On-Campus Events', 'Off-Campus Events', 'Festival Meet'])
        .withMessage('Category must be one of: Committee Events, Group Events, On-Campus Events, Off-Campus Events, Festival Meet')
        .trim().escape(),
    body('details', 'Details cannot be empty and minimum 10 letters are required').notEmpty().isLength({ min: 10 }).trim().escape(),
    body('where', 'Location cannot be empty').notEmpty().trim().escape(),
    body('startDateTime', 'Start DateTime must be in the format yyyy-mm-ddThh:mm').matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).trim().notEmpty().escape(),
    body('endDateTime', 'End DateTime must be in the format yyyy-mm-ddThh:mm').matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).trim().notEmpty().escape(),
    body('email', 'Email cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email must be valid').isEmail().normalizeEmail().trim().escape(),
    body('contactPerson', 'Contact Person cannot be empty').notEmpty().trim().escape(),
];

exports.validateRsvp = [
    body('status', 'RSVP status must be one of: Yes, Maybe, No').isIn(['Yes', 'Maybe', 'No']).trim().notEmpty().escape(),
];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
};
