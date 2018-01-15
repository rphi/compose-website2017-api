var MailGun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_API_DOMAIN});
var Mailgen = require('mailgen');

class Email {
  constructor() {
    this.mgen = new Mailgen({
      theme: 'salted',
      product: {
        name: 'CompSoc Hoodie',
        link: 'https://comp-soc.com/',
        logo: 'https://comp-soc.com/static/img/compsoc-horizontal.png',
        copyright: 'CompSoc ♥ You.',
      }
    })
  }

  sendMail(subject, emailContent, address, msgID) {
    const email = this.mgen.generate(emailContent);

    const mgData = {
      from: 'CompSoc Edinburgh <hello@comp-soc.com>',
      to: address,
      subject: subject,
      html: email,
      'h:Message-ID': msgID + "@stripe.comp-soc.com",
      'h:In-Reply-To': msgID + '@stripe.comp-soc.com',
    }
    MailGun.messages().send(mgData)
      .catch(function(err) {
        console.log(err);
      });
  }
}

module.exports = Email;