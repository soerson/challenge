const validateAmount = (req, res, next) => {
    const amount = parseInt(req.query.amount);
    if (!amount) {
        res.status(400).send('Amount is required')
        return
    }
    if (amount < 0) {
        res.status(400).send('Amount must be positive')
        return
    }

    req.amount = amount
    next()
};

module.exports = { validateAmount };
