
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
  //TODO - USE PROPER DB AND SETTINGS
  staging: {
    client: 'mysql',
    connection: {
      // host: '93.104.208.114',
       port: '/var/run/mysqld/mysqld.sock',
      // database: 'dex-users-test',
      // user:     'dex_vg4',
      // password: 'Slj1z1&2'
      host: '93.104.208.114',
      database: 'dex-users',
      user:     'dex_vg3',
      password: 'Ojyf831%'
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
      host: '93.104.208.114',
      database: 'dex-users',
      user:     'dex_vg3',
      password: 'Ojyf831%'
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
