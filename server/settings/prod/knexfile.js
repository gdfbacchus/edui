// Update with your config settings.
//LOCAALHOST SETTINGS
module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      database: 'dex-users',
      user:     'root',
      password: '123'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: '5.189.130.184',
      database: 'dex-users-test',
      user:     'vgashevski2',
      password: 'plZ10^7r'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: '5.189.130.184',
      database: 'dex-users',
      user:     'dex',
      // password: 'Cpqe30?6'//'2tP$be02'
      password: 'Lj6#aSuJNz8$Po'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};


//REMOTE SERVER SETTINGS
// module.exports = {
//
//   development: {
//     client: 'mysql',
//     connection: {
//       host: '5.189.130.184',
//       port: '/var/run/mysqld/mysqld.sock',
//       database: 'USERS',
//       user:     'dex',
//       password: '^zcrN114',
//       //socketPath : '/var/lib/mysqld/mysqld.sock'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   },
//
//   staging: {
//     client: 'mysql',
//     connection: {
//       host: '5.189.130.184',
//       port: '/var/run/mysqld/mysqld.sock',
//       database: 'USERS',
//       user:     'dex',
//       password: '^zcrN114',
//       //socketPath : '/var/lib/mysqld/mysqld.sock'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   },
//
//   production: {
//     client: 'mysql',
//     connection: {
//       host: '5.189.130.184',
//       port: '/var/run/mysqld/mysqld.sock',
//       database: 'USERS',
//       user:     'dex',
//       password: '^zcrN114',
//       //socketPath : '/var/lib/mysqld/mysqld.sock'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   }
//
// };
