const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Job = require("../models/jobModel");

const removeImage = require("../utils/remove_image");
const upload_images = require("../utils/store_user_images");
const upload_user_image = upload_images.array('user_photo');


const getUsers = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const users = await User.find({});

            if (!users) return res.status(422).json({ message: "Operation Failed" });
            res.json(users);
        } catch (error) {
            next(error);
        }
    }
);


const getUserData = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const user = await User.findOne({ user_id: req.params.user_id });

            if (!user) return res.status(422).json({ message: "User Not Found" });
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
);


const addUser = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const existed = await User.findOne({
                $or: [
                    { user_id: req.body.user_id },
                    { user_email: req.body.user_email }
                ]
            });

            if (existed) return res.status(422).json({ message: "User account found" });
            if (!["Freelancer", "Client"].includes(req.body.user_role)) return res.status(422).json({ message: "Not Allowed" })

            const new_user = await User.create({
                "user_id": req.body.user_id,
                "user_name": req.body.user_name,
                "user_email": req.body.user_email,
                "user_mobile": req.body.user_mobile,
                "user_role": req.body.user_role,
            })

            if (!new_user.createdAt) res.status(422).json({ message: "Account creation failed" })
            res.status(201).json({ message: "Account created with success" });
        } catch (error) {
            next(error);
        }
    }
);


const processEditUser = async (req, res, user_photo) => {
    try {
        const { user_name, user_email, user_mobile } = req.body;
        const existed_user = await User.findOne({ user_id: req.params.user_id });

        if (!existed_user) {
            if (user_photo) removeImage(`${process.cwd()}/app/assets/users/${user_photo}`);
            return res.status(422).json({ message: "Operation Failed" });
        }

        if (user_email) {
            const existed_user_email = await User.findOne({ user_email: user_email });

            if (existed_user_email?.user_email === user_email) {
                if (user_photo) removeImage(`${process.cwd()}/app/assets/users/${user_photo}`);
                return res.status(422).json({ message: "This email belongs to another user" });
            }
            existed_user.user_email = user_email || existed_user.user_email;
        }

        existed_user.user_name = user_name || existed_user.user_name;
        existed_user.user_mobile = user_mobile || existed_user.user_mobile;

        if (user_photo) {
            if (existed_user.user_photo !== "" && existed_user.user_photo !== "default.png") {
                removeImage(`${process.cwd()}/app/assets/users/${existed_user.user_photo}`);
            }
            existed_user.user_photo = user_photo;
        }

        const updatedUser = await existed_user.save();

        if (!updatedUser) {
            if (user_photo) removeImage(`${process.cwd()}/app/assets/users/${user_photo}`);
            return res.status(422).json({ message: "Failed to update user" });
        }

        res.status(200).json({ message: "Account Updated" });
    } catch (error) {
        if (user_photo) removeImage(`${process.cwd()}/app/assets/users/${user_photo}`);
        next(error);
    }
}

const editUser = expressAsyncHandler(async (req, res, next) => {
    let user_photo;
    try {
        upload_user_image(req, res, async (err) => {
            if (err) res.status(err.statusCode).json({ message: err.message });

            if (req?.files && req.files.length > 0) {
                const uploaded = req?.files[0];
                user_photo = uploaded?.filename;
            }

            await processEditUser(req, res, user_photo);
        });
    } catch (error) {
        if (user_photo) removeImage(`${process.cwd()}/app/assets/users/${user_photo}`);
        next(error);
    }
});


const addToFavs = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const user = await User.findOne({ user_id: req.params.user_id });
            const job = await Job.findOne({ _id: req.body.job_id });

            if (!user) return res.status(422).json({ message: "User not found" });
            if (user.user_role !== "Freelancer") return res.status(422).json({ message: "Operation Not Allowed" });

            if (user.favorites.includes(job.id)) return res.status(422).json({ message: "Job is already in your favorites" });

            user.favorites.push(job.id);
            const saved = await user.save();

            if (!saved.isModified) return res.status(200).json({ message: "Nothing Changed" });
            res.status(200).json({ message: "Job added to favorites" });
        } catch (error) {
            next(error);
        }
    }
)


const removeFromFavs = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const user = await User.findOne({ user_id: req.params.user_id });
            const job = await Job.findOne({ _id: req.body.job_id });

            if (!user) return res.status(422).json({ message: "User Not Found" });
            if (user?.user_role !== "Freelancer") return res.status(422).json({ message: "Operation Denied" });
            if (!job) return res.status(422).json({ message: "Job not found or might have been deleted" });
            if (!user.favorites.includes(job?.id)) return res.status(422).json({ message: "Job is not in your favorites" });

            user.favorites = user.favorites.filter(job_id => job_id !== job?.id);
            const saved = await user.save();

            if (!saved.isModified) return res.status(200).json({ message: "No Updates" });
            res.status(200).json({ message: "Job removed from favorites" });
        } catch (error) {
            next(error);
        }
    }
)


const allFavs = async (job_id, next) => {
    try {
        const clean_favs = await User.find({}, { "favorites": 1, "_id": 0 });
        for (let idx = 0; idx < clean_favs.length; idx++) {
            if (clean_favs[idx].favorites.includes(job_id)) {
                clean_favs[idx].favorites = clean_favs[idx].favorites.filter(id => id !== job_id);
                await clean_favs[idx].save();
            }
        }
    } catch (error) {
        next(error)
    }
}


const cleanUsers = expressAsyncHandler(
    async (req, res) => {
        try {
            const users = await User.deleteMany({});
            if (users.deletedCount !== 0) res.status(200).json({ message: "Deleted" })
        } catch (error) {
            console.log(error);
        }
    }
);


module.exports = { getUsers, getUserData, addUser, editUser, cleanUsers, addToFavs, removeFromFavs };
