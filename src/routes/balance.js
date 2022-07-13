const { Router } = require('express')
const { validateAmount } = require('../middleware/validateAmount');
const { getProfile } = require('../middleware/getProfile');

const router = Router()

router.post(
    '/deposit/:userId',
    validateAmount,
    async (req, res) => {
        const { Profile } = req.app.get('models')
        const profileId = req.profile.id
        const amount = req.amount
        const user = await Profile.findOne({ id: profileId })
        if (user.balance * 0.25 < amount) {
            res.status(400).send('Too high amount')
        }

        await user.update({ balance: user.balance + amount })
        res.send(true)

    },
)

module.exports = router
