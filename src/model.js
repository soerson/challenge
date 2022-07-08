const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3',
});

class Profile extends Sequelize.Model {
    static async payForJob(job) {
        const jobId = job.id
        const clientId = job.Contract.ClientId
        const clientBalance = job.Contract.Client.balance
        const contractorId = job.Contract.ContractorId
        const contractorBalance = job.Contract.Contractor.balance
        const amount = job.price


        return await sequelize.transaction(async transaction => {
            try {
                await Promise.all([
                    Profile.update(
                        { balance: clientBalance - amount },
                        { where: { id: clientId }, transaction },
                    ),
                    Profile.update(
                        { balance: contractorBalance + amount },
                        { where: { id: contractorId }, transaction },
                    ),
                    Job.update(
                        { paid: true },
                        { where: { id: jobId }, transaction },
                    ),
                ])
                return true
            } catch (e) {
                return false
            }

        })
    }
}

Profile.init(
    {
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        profession: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        balance: {
            type: Sequelize.DECIMAL(12, 2),
        },
        type: {
            type: Sequelize.ENUM('client', 'contractor'),
        },
    },
    {
        sequelize,
        modelName: 'Profile',
    },
);

class Contract extends Sequelize.Model {
    static findOneByIdAndProfile(id, profileId) {
        return Contract.findOne({
            where: {
                id,
                [Op.and]: [
                    {
                        [Op.or]: [
                            { ContractorId: profileId },
                            { ClientId: profileId },
                        ],
                    },
                ],
            },
        })
    }

    static findAllNotTerminatedByProfile(profileId) {
        return Contract.findAll({
            where: {
                status: { [Op.ne]: 'terminated' },
                [Op.and]: [
                    {
                        [Op.or]: [
                            { ContractorId: profileId },
                            { ClientId: profileId },
                        ],
                    },
                ],
            },
        })
    }
}

Contract.init(
    {
        terms: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
        },
    },
    {
        sequelize,
        modelName: 'Contract',
    },
);

class Job extends Sequelize.Model {
    static findAllUnpaidByActiveContractAndProfile(profileId) {
        return Job.findAll({
            where: {
                paid: true,
            },
            include: {
                model: Contract,
                required: true,
                where: {
                    status: 'in_progress',
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { ContractorId: profileId },
                                { ClientId: profileId },
                            ],
                        },
                    ],
                },
            },
        })
    }

    static findJobToBePaid(jobId, profileId) {
        return Job.findOne({
            where: {
                id: jobId,
                [Op.and]: {
                    [Op.or]: [
                        { paid: false },
                        { paid: null },
                    ],
                },
            },
            include: {
                model: Contract,
                required: true,
                where: {
                    /**
                     * this is not mentioned in a description
                     * but there is a comment that a contract is active if status: in_progress
                     * so decided to add it here as there is no much reason to pay for
                     * a not active contract
                     */
                    status: 'in_progress',
                },
                include: [{
                    model: Profile,
                    as: 'Client',
                    required: true,
                    where: { id: profileId },
                }, {
                    model: Profile,
                    as: 'Contractor',
                    required: true,
                }],
            },
        })
    }
}

Job.init(
    {
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        price: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
        },
        paid: {
            type: Sequelize.BOOLEAN,
            default: false,
        },
        paymentDate: {
            type: Sequelize.DATE,
        },
    },
    {
        sequelize,
        modelName: 'Job',
    },
);

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' })
Contract.belongsTo(Profile, { as: 'Contractor' })
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' })
Contract.belongsTo(Profile, { as: 'Client' })
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
    sequelize,
    Profile,
    Contract,
    Job,
};
