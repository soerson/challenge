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
    const contract = await Contract.findOneByIdAndProfile(id, req.profile.id)
    if (!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const contracts = await Contract.findAllNotTerminatedByProfile(req.profile.id)
    if (!contracts || contracts.length === 0) return res.status(404).end()
    res.json(contracts)
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const { Job } = req.app.get('models')
    const jobs = await Job.findAllUnpaidByActiveContractAndProfile(req.profile.id)
    if (!jobs || jobs.length === 0) return res.status(404).end()
    res.json(jobs)
})

module.exports = app;
