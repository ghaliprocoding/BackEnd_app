const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Job = require("../models/jobModel");

const removeImage = require("../utils/remove_image");
const upload_images = require("../utils/store_job_images");
const upload_job_image = upload_images.array('job_image');


const getJobs = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const jobs = await Job.find({});
            res.status(200).json(jobs);
        } catch (error) {
            next(error);
        }
    }
);


const getJobData = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const job = await Job.findOne({ _id: req.params.job_id });

            if (!job) return res.status(422).json({ message: "Not Found" });
            res.status(200).json(job);
        } catch (error) {
            next(error);
        }
    }
);


const searchJob = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const query = req.params.query;
            const jobs_onQuery = await Job.find({ $text: { $search: query } });

            if (jobs_onQuery.length < 1) return res.status(200).json({ message: "No results." })
            res.status(200).json(jobs_onQuery);
        } catch (error) {
            next(error);
        }
    }
)


const jobsOwner = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const jobs = await Job.find({ "freelancer_id": req.params.user_id });

            if (jobs.length < 1) res.status(200).json({ message: "This freelancer have 0 jobs" });
            res.status(200).json(jobs);
        } catch (error) {
            next(error);
        }
    }
);


const addJob = expressAsyncHandler(
    async (req, res, next) => {
        let job_image;

        upload_job_image(req, res, async function (err) {
            try {
                if (err) return res.send({ message: err.message });

                if (req?.files && req?.files?.length > 0) {
                    const uploaded = req?.files[0];
                    job_image = uploaded?.filename;
                }

                const check_freelancer = await User.findOne({ user_id: req.body.freelancer_id });
                const existed_job = await Job.findOne({ title: req.body.title });

                if (existed_job) {
                    removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                    return res.status(422).json({ message: "This job title is taken" });
                }

                if (check_freelancer.user_role !== "Freelancer") {
                    removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                    return res.status(422).json({ message: "Denied" });
                }

                const new_user = await Job.create({
                    "freelancer_id": req.body.freelancer_id,
                    "title": req.body.title,
                    "desc": req.body.desc,
                    "job_location": req.body.job_location,
                    "job_category": req.body.job_category,
                    "job_image": job_image,
                    "job_option": req.body.job_option,
                    "job_pricing": req.body.job_pricing,
                })

                if (!new_user) {
                    removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                    return res.status(422).json({ message: "Failed" });
                }

                res.status(200).json({ message: "Done" });
            } catch (error) {
                removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                next(error);
            }
        });
    }
);


const editJob = expressAsyncHandler(
    async (req, res, next) => {
        let job_image;

        upload_job_image(req, res, async function (err) {
            try {
                if (err) return res.status(400).send({ message: err.message });

                if (req?.files && req?.files?.length > 0) {
                    const uploaded = req?.files[0];
                    job_image = uploaded?.filename;
                }

                const existed_job = await Job.findOne({ _id: req.params.job_id });
                const job_owner = await User.findOne({ user_id: existed_job?.freelancer_id });

                if (!existed_job || job_owner?.user_role !== "Freelancer") {
                    removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                    return res.status(422).json({ message: "Denied" });
                }

                const { title, desc, job_location, job_category, job_option, job_pricing } = req.body;
                const check_title = await Job.findOne({ title: title });

                if (check_title?.title) {
                    if (job_image) removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                    return res.status(422).json({ message: "This job title is used." });
                }

                existed_job.title = title || existed_job.title;
                existed_job.desc = desc || existed_job.desc;
                existed_job.job_location = job_location || existed_job.job_location;
                existed_job.job_category = job_category || existed_job.job_category;
                existed_job.job_option = job_option || existed_job.job_option;
                existed_job.job_pricing = job_pricing || existed_job.job_pricing;

                if (job_image) {
                    if (existed_job.job_image) removeImage(`${process.cwd()}/app/assets/jobs/${existed_job.job_image}`);
                    existed_job.job_image = job_image;
                }

                const updated = await existed_job.save();

                if (!updated) return res.status(422).json({ message: "No Updates" });
                res.status(200).json({ message: "Updated" });
            } catch (error) {
                removeImage(`${process.cwd()}/app/assets/jobs/${job_image}`);
                next(error);
            }
        });
    }
);


const deleteJob = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const findJob = await Job.findOne({ _id: req.params.job_id, freelancer_id: req.params.user_id });
            if (!findJob) return res.status(422).json({ message: "Job not found" });

            const deleted = await Job.deleteOne({ _id: findJob.id });
            if (deleted.deletedCount === 0) res.status(422).json({ message: "Operation Failed" });

            removeImage(`${process.cwd()}/app/assets/jobs/${findJob.job_image}`);
            res.status(200).json({ message: "Deleted" });
        } catch (error) {
            next(error);
        }
    }
);


const cleanJobs = expressAsyncHandler(
    async (req, res, next) => {
        try {
            const jobs = await Job.deleteMany({});
            if (jobs.deletedCount !== 0) res.status(200).json({ message: "Deleted" })
        } catch (error) {
            next(error);
        }
    }
);


module.exports = { getJobs, addJob, editJob, deleteJob, searchJob, jobsOwner, getJobData, cleanJobs };
