const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const adminRouter = require('./routes/admin');
const jobsRouter = require('./routes/jobs');
const balanceRouter = require('./routes/balance');
const contractsRouter = require('./routes/contracts');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use('/contracts', contractsRouter)
app.use('/jobs', jobsRouter)
app.use('/balance', balanceRouter)
app.use('/admin', adminRouter)

module.exports = app;
