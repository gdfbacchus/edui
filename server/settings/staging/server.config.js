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
    port: 8082,
    address: 'http://localhost:8082/'
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
    case "production": case "staging":
      defaultConfig.emailConfig = {
        smtp:{
          host: 'localhost',
          // port: 587,
          port: 25,
          //secure: true,
          auth: {
            // user: 'admin@easydex.net',
            // pass: 'P@te1incho'
            user: "vg@easydex.info",
            pass: "meV466l&"
          },
          tls: {rejectUnauthorized: false}
        },
        custom1:  {
          host: 'smtp.office365.com',
          secure: false,
          port: 587,
          auth: {
            user: 'support@easydex.net',
            pass: 'P@te1incho' //'P@teM0rj'//p@tem0rj'
          },
          requireTLS: true,
          tls:{
            ciphers:'SSLv3'
          }
        },
        gmail: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // use SSL
          auth: {
            user: 'easydexverify@gmail.com',
            pass: 'duckrus81269'
          }
        }
      };
      //TODO - USE DOMAIN NAME
      //DOMAIN NAME
      //defaultConfig.nodeServer.address = 'https://exchange.easydex.info/'; //'http://exchange.easydex.net/';
      //IP
      defaultConfig.nodeServer.address = 'http://93.104.208.114:3000/'; //'http://exchange.easydex.net/';
      defaultConfig.nodeServer.host = '93.104.208.114'; //'easydex.net';
      defaultConfig.nodeServer.port = 3000;

      break;

    case "development":
      if(os==='win32') {
        defaultConfig.emailConfig = {
          service: 'gmail',
          auth: {
            user: 'vgashevski@gmail.com',//email@gmail.com
            pass: ''
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

module.exports.getConfig = getConfig;
