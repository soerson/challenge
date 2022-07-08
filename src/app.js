const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const profileId = req.profile.id;
    const contract = await Contract.findOneByIdAndProfile(id, profileId)
    if (!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const profileId = req.profile.id;
    const contracts = await Contract.findAllNotTerminatedByProfile(profileId)
    if (!contracts || contracts.length === 0) return res.status(404).end()
    res.json(contracts)
})

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const profileId = req.profile.id
    const jobId = req.params['job_id']
    const { Job, Profile } = req.app.get('models')
    const job = await Job.findJobToBePaid(jobId, profileId)
    if (!job) res.status(400).send('Job could not be paid')

    const result = await Profile.payForJob(job)
    res.send(result)
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const { Job } = req.app.get('models')
    const profileId = req.profile.id;
    const jobs = await Job.findAllUnpaidByActiveContractAndProfile(profileId)
    if (!jobs || jobs.length === 0) return res.status(404).end()
    res.json(jobs)
})

module.exports = app;
