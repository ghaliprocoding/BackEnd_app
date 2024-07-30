const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    user_mobile: {
        type: String,
        required: true
    },
    user_role: {
        type: String,
        required: true
    },
    user_photo: {
        type: String,
        default: "default.png"
    },
    user_rating: {
        type: Number,
        default: 0
    },
    favorites: {
        type: Array,
        default: []
    }
},
    { timestamps: true, strict: true, versionKey: false }
);


module.exports = mongoose.model("User", UserSchema);