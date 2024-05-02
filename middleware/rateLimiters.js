const rateLimit= require("express-rate-limit");
exports.logInLimiter = rateLimit({
    windowMs: 60 * 1000,
    max:5,
    //message:'to many login requist. Try again later'
    handler: (req, res, next)=>{
        let err = new Error('too many login requests.Try amain later');
        err.status = 429;
        return next(err);
    }
});