const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3',
});

class Profile extends Sequelize.Model {
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
                }
            }
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
