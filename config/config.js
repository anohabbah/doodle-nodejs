const commonOptions = {
  operatorsAliases: false,
  define: {
    underscored: true,
    freezeTableName: false,
    charset: 'utf8',
    dialectOptions: { collate: 'utf8_general_ci' },
    timestamps: true
  }
};

module.exports = {
  development: {
    username: 'root',
    password: '',
    database: 'db_doodle',
    host: '127.0.0.1',
    dialect: 'mysql',
    ...commonOptions
  },
  test: {
    database: ':memory:',
    dialect: 'sqlite',
    ...commonOptions
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DRIVER,
    ...commonOptions
  }
};
