var defaultConfig = {
  emailConfig: {
    singleConn: {
      host: 'localhost',
      port: 25,
      secure: false, // upgrade later with STARTTLS
      // tls: {
      //     rejectUnauthorized: true
      // },
      ignoreTLS: true
      //auth: {
      //user: '',
      //pass: ''
      //}
    }
  },
  nodeServer: {
    os: '',
    env: '',
    host: 'localhost',
    port: '8080',
    address: 'http://localhost:8080/'
  }
};

function _getPlatform() {
  return (process.platform).trim();
}

function _getEnv() {
  return  process.env.NODE_ENV ? (process.env.NODE_ENV).trim() : 'development';
}

var getConfig = function() {
  var os = _getPlatform();
  var env = _getEnv();

  defaultConfig.nodeServer.env = env;
  defaultConfig.nodeServer.os = os;

  switch(env) {
    case "production":
      defaultConfig.emailConfig = {
        host: 'localhost',
        port: 25,
        secure: false, // upgrade later with STARTTLS
        ignoreTLS: true
      };
      break;
    case "development":
      if(os==='win32') {
        defaultConfig.emailConfig = {
          service: 'gmail',
          auth: {
            user: 'vgashevski@gmail.com',//email@gmail.com
            pass: 'vitOOO000'
          }
        };
      } else if (os==='linux' || os==='darwin' || os==='freebsd' || os==='openbsd') {
        defaultConfig.emailConfig = {
          host: 'localhost',
          port: 25,
          secure: false,
          ignoreTLS: true
          //auth: { //IN CASE OF AUTH, USE THIS OBJECT:
            //user: '',
            //pass: ''
          //}
        }
      }
      break;

    default:
      break;
  }
  return defaultConfig;
};

var getBitcoinConfig = () => {
  var env = _getEnv();
  var config = {
    host: 'localhost',//5.189.130.184:8332
    port: 8332,// or 8443
    user: 'bcc',
    pass: 'core322',
    timeout: 30000
  };

  switch(env) {
    case "production":
      config.host = 'localhost';//'5.189.130.184'
      config.port = '8332';
      break;

    case "development":
      config.host = 'localhost';//5.189.130.184
      config.port = '8332';
      break;

    default:
      break;
  }

  return config;
};

var getDbSettings = function() {
  var env = _getEnv();
  var config = {
    host     : 'localhost',
    user     : 'dex',
    password : '2tP$be02',
    database : 'dex-api'
  };

  switch(env) {
    case "production":
      //config.user = 'dex';
      config.user = 'walrus';
      //config.password = '2tP$be02';
      config.password = 'Qlyc2@66';
      break;

    case "development":
      config.user = 'root';
      config.password = '123';
      break;

    default:
      break;
  }

  return config;
};

module.exports.getConfig = getConfig;
module.exports.getBitcoinConfig = getBitcoinConfig;
module.exports.getDbSettings = getDbSettings;
