module.exports = {
  emailConfig: {
    gmail: {
      service: 'gmail',
      auth: {
        user: 'vgashevski@gmail.com',
        pass: ''
      }
    },
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
  }
};
