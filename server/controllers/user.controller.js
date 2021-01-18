import User from '../models/user.model'
import extend from 'lodash/extend'
import errorHandler from './error.controller'

// The creat controller function creates a new user with the JSON object that was
// received in the POST request within req.body. Call to user.save attempts to save the
// user in the DB after mongoose has validated the data.
const create = async (req, res) => {
    const user = new User(req.body);
    try{
        await user.save();
        return res.status(200).json({
            message: 'Successfully signed up.'
        });
    }catch(err){
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

// The list controller function finds all users in th DB and populates only the name,
// email, date updated and date created. This is then returned as JSON objects in an 
// array to the requesting client.
const list = async (req, res) => {
    try{
        let users = await User.find().select('name email updated created');
        res.json(users);
    }catch(err){
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

// The userByID controller function uses the value in :userId to querey the DB by _id
// and load the matching user's details.
// If the user is found in the DB, then the user object is attatched to the request
// object in the profile key. Then, the next() middleware is called to send to the
// relevant action. (read, update, remove).
const userByID = async (req,res, next, id) => {
    try{
        let user = await User.findById(id);
        if(!user){
            return res.status('400').json({
                error: 'User not found.'
            });
        }
        req.profile = user;
        next();
    }catch(err){
        return res.status('400').json({
            error: 'Could not retrieve user.'
        });
    }
}

// The read controller function takes the user details from req.profile and removes
// sensetive details such as hashed_password and salt values before sending the object 
// in the response.
const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

// The update controller function takes user details from req.profile and uses the extend
// module from lodash to extand and merge the changes that came in the request body to
// update the user data. Before saving the data, the updated field is populated with the
// current date and the object is cleaned from sensative data.
const update = async (req, res) => {
    try{
        let user = req.profile;
        user = extend(user, req.body); // From lodash module
        user.updated = Date.now();
        await user.save();
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    }catch(err){
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

// Add comments
const remove = async (req, res) => {
    try{
        let user = req.profile;
        let deletedUser = await user.remove();
        deletedUser.hashed_password = undefined;
        deletedUser.salt = undefined;
        res.json(deletedUser);
    }catch(err){
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
}

export default { create, list, userByID, read, update, remove }