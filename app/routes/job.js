const express = require("express");
const { getJobs, addJob, editJob, deleteJob, searchJob, jobsOwner, getJobData, cleanJobs } = require("../controllers/jobController");


const router = express.Router();

// get all jobs
router.route('/').get(getJobs);

// delete all jobs
router.route('/delete_jobs').delete(cleanJobs);

// get single job
router.route('/:job_id').get(getJobData);

// get freelancer jobs
router.route('/freelancer/:user_id').get(jobsOwner);

// search for job
router.route('/search/:query').get(searchJob);

// add job
router.route('/add').post(addJob);

// update job
router.route('/edit/:job_id').patch(editJob)

// delete job
router.route('/delete/:job_id/:user_id').delete(deleteJob);

module.exports = router;
