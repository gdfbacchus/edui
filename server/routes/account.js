var aes256 = require('aes256');
var sha256 = require("sha256");
var nodemailer = require('nodemailer');
var conf = require ('../server.config.js');
var config = conf.getConfig();
var getCurrentUTCtime = require('../utils/dateHelper').getCurrentUTCtime;
var bookshelf = require('../bookshelf');
var User = bookshelf.Model.extend({
  tableName: 'info'
});

const storeEncryptedPassword = (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var question = req.body.question;
  var answer = req.body.answer;
  var password = req.body.password;
  var verified = 0;

  answer = answer.toLowerCase();
  const key = question + '===' + username + "===" + answer;
  const ekey = aes256.encrypt(password, key);
  const encryptedPass2 = aes256.encrypt(ekey, password);
  password = encryptedPass2;
  const created_date = getCurrentUTCtime();

  User.forge({
    username, password, email, question, verified, ekey, created_date
  }, { hasTimestamps: false }).save()
    .then(user => {
      res.status(201).json({ success: true });
    })
    .catch(err => {
      console.log("server err: ", err);
      res.status(500).json({ error: err })
    });
};

const usernameVerification = (req, res) => {
  var form_username = req.body.username;

  User.where('username',form_username ).fetch()
    .then(function(user) {
      const uname = JSON.stringify(user.get('username'));
      const user_email = JSON.stringify(user.get('email'));
      const user_question = JSON.stringify(user.get('question'));
      const token = sha256(user_question + uname);
      const id = parseInt(user.get('ID'));
      const data ={
        uname,
        user_email,
        user_question,
        token,
        id
      };
      //TODO Get address from config or constants
      const serverAddress = config.nodeServer.address + 'forgot-password/';
      const htmlContent = prepareHtmlEmailContent(serverAddress, token);

      sendEmail(data, htmlContent, function(error){
        if (error) {
          console.log("server err: ", error);
          res.status(500).json({ error: "Internal server error. Service [2] does not work." });
          return;
        }

        User.where({ID: id}).save({token: token}, {patch: true}).then(function(model) {
          //console.log("hash token [" + token + "] has been saved.");
          res.status(201).json({ success: true});

        }).catch(error => {
          console.log("ERROR:: ",error);
          res.status(500).json({ error: error });
        });
      });

    })
    .catch(err => {
      console.log("server err: ", err);
      res.status(500).json({ error: err });
    });
};

const tokenVerification = (req, res) => {
  var currentENV = (process.env.NODE_ENV).trim();
  console.log("Current ENV: ", "["+currentENV+"]");
  //console.log("Config: ", config);

  var receivedToken = req.body.token;

  User.where('token',receivedToken ).fetch()
    .then(function(user) {
      const user_question = user.get('question');
      const user_question_str = JSON.stringify(user.get('question'));
      const token = JSON.stringify(user.get('token'));
      receivedToken = JSON.stringify(receivedToken);

      if(receivedToken===token) {
        res.status(201).json({ success: true, user_question, user_question_str});
      } else {
        res.status(500).json({ error: 'Invalid or expired token' })
      }
    })
    .catch(err => {
      console.log("server err: ", err);
      res.status(500).json({ error: 'Invalid or expired token.'})
    });
};

const answerVerification = (req, res) => {
  var receivedAnswer = req.body.answer.toLowerCase();
  var receivedToken = req.body.token;

  User.where('token',receivedToken ).fetch()
    .then(function(user) {
      const password = user.get('password');
      const question = user.get('question');
      const username = user.get('username');
      const ekeyDB = user.get('ekey');
      const token = JSON.stringify(user.get('token'));
      receivedToken = JSON.stringify(receivedToken);

      //STEP 1 GET KEY
      var key = question + '===' + username + "===" + receivedAnswer;

      //STEP2 GET DECRYPTED PASSWORD
      const decryptedPass = decryptPass(ekeyDB, password);

      //STEP 3 DECRYPT STORED KEY
      var decKey = decryptPass(decryptedPass, ekeyDB);

      //STEP 4 KEYS COMPARISON
      const isCorrectKey = key === decKey;

      if(isCorrectKey){
        const id = parseInt(user.get('ID'));

        res.status(201).json({ success: true, decryptedPass});
        deletTokenAndEncryptedKey(id);
      } else {
        res.status(500).json({ error: 'Failed to recover the password' })
      }
    })
    .catch(err => {
      console.log("server err: ", err);
      res.status(500).json({ error: err })
    });
};

const decryptPass = (key, value) => {
  var decrypted = null;
  if(key && value){
    decrypted = aes256.decrypt(key, value);
  }
  return decrypted;
};

const deletTokenAndEncryptedKey = (id) => {
  User.where({ID: id}).save({token: ''}, {patch: true}).then(function(model) {
  }).catch(error => {
    console.log("ERROR:: ",error);
    reject(error);
  });
};

sendEmail = (data, htmlContent, callback) => {
  //console.log("custom1 config: ",config.emailConfig.custom1);
  var transporter = nodemailer.createTransport(config.emailConfig.smtp);
  // var transporter = nodemailer.createTransport(config.emailConfig.custom1);

  var mailOptions = {
    from: 'admin@easydex.net', // sender address
    to: [data.user_email], // list of receivers
    subject: 'Recovery Mail Service', // Subject line
    //text: text , // plaintext body
    html: htmlContent
  };

  /* // verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.log('Nodemailer transporter failed.');
      console.log('ERROR: ', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });
  */
  transporter.sendMail(mailOptions, function(error){
    if(typeof callback === "function"){
      callback(error)
    };
    return;
  });
};

prepareHtmlEmailContent = (serverAddress, token) => {
  const link = serverAddress + token;
  const htmlLink = '<a href="' + link + '" target="_blank">' + link + '</a>';
  return '<div>' +
    '<p>You are receiving this email as part of the EasyDex password recovery process.</p>' +
    '<p>To continue recovering your password follow the link below.</p>'+
    '<p>' + htmlLink + '</p>' +
    '<br /><p>If you did not initiate this action or feel you are receiving this email in error contact customer support at <a href="mailto:support@easydex.net">support@easydex.net</a>.</p> ';
};

module.exports.storeEncryptedPassword = storeEncryptedPassword;
module.exports.usernameVerification = usernameVerification;
module.exports.tokenVerification = tokenVerification;
module.exports.answerVerification = answerVerification;
