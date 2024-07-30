const express = require("express");
const { getUsers, addUser, editUser, getUserData, cleanUsers, addToFavs, removeFromFavs } = require("../controllers/userController");


const router = express.Router();

// get all users
router.route('/').get(getUsers);

// add user
router.route('/add').post(addUser);

// delete all users
router.route('/delete_users').delete(cleanUsers);

// get single user
router.route('/:user_id').get(getUserData);

// update user
router.route('/edit/:user_id').patch(editUser);

// add to favorites
router.route("/user/favorites/:user_id").post(addToFavs);

// remove to favorites
router.route("/user/favorites/:user_id").delete(removeFromFavs);

module.exports = router;
