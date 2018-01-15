var MailGun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_API_DOMAIN});
var Mailgen = require('mailgen');

class Email {
  constructor() {
    this.mgen = new Mailgen({
      theme: 'salted',
      product: {
        name: 'CompSoc Hoodie',
        link: 'https://comp-soc.com/',
        logo: 'https://comp-soc.com/static/img/compsoc-horizontal.svg',
        copyright: 'CompSoc ♥ You.',
      }
    })
  }

  sendMail(subject, emailContent, address, msgID) {
    const email = this.mgen.generate(emailContent);
    console.log('sending msg-id',msgID)
    const mgData = {
      from: 'CompSoc Edinburgh <hello@comp-soc.com>',
      to: address,
      subject: subject,
      html: email,
      'h:Message-ID': msgID,
    }
    MailGun.messages().send(mgData)
      .catch(function(err) {
        console.log(err);
      });
  }
}

module.exports = Email;