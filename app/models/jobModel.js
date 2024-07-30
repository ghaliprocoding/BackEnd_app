const mongoose = require("mongoose");


const jobSchema = new mongoose.Schema({
    freelancer_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true
    },
    job_location: {
        type: String,
        required: true
    },
    job_category: {
        type: String,
        required: true
    },
    job_image: {
        type: String,
        required: true
    },
    job_option: {
        type: String,
        required: true
    },
    job_pricing: {
        type: Number,
        required: true,
        min: 50,
    },
    job_rating: {
        type: Number,
        default: 0
    }
}, { timestamps: true, strict: true, versionKey: false });


module.exports = mongoose.model("Job", jobSchema);