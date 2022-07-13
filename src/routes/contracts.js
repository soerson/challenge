const { Router } = require('express')
const { getProfile } = require('../middleware/getProfile');
const router = Router()

router.get('/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const profileId = req.profile.id;
    const contract = await Contract.findOneByIdAndProfile(id, profileId)
    if (!contract) return res.status(404).end()
    res.json(contract)
})

router.get('/', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const profileId = req.profile.id;
    const contracts = await Contract.findAllNotTerminatedByProfile(profileId)
    if (!contracts || contracts.length === 0) return res.status(404).end()
    res.json(contracts)
})

module.exports = router
