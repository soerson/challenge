const { Router } = require('express')
const { getProfile } = require('../middleware/getProfile');
const router = Router()

router.post('/:job_id/pay', getProfile, async (req, res) => {
    const profileId = req.profile.id
    const jobId = req.params['job_id']
    const { Job, Profile } = req.app.get('models')
    const job = await Job.findJobToBePaid(jobId, profileId)
    if (!job) res.status(400).send('Job could not be paid')

    const result = await Profile.payForJob(job)
    res.send(result)
})

router.get('/unpaid', getProfile, async (req, res) => {
    const { Job } = req.app.get('models')
    const profileId = req.profile.id;
    const jobs = await Job.findAllUnpaidByActiveContractAndProfile(profileId)
    if (!jobs || jobs.length === 0) return res.status(404).end()
    res.json(jobs)
})

module.exports = router
