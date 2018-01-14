class HoodieUtils {
  constructor() {
    this.hoodies = {
      'JH001': {
        name: 'College Hoodie',
        cost: 2500,
        zip: false,
        style: 'unisex',
      },

      'JH01F': {
        name: 'Girlie College Hoodie',
        cost: 2500,
        zip: false,
        style: 'womens',
      },

      'JH050': {
        name: 'Zoodie',
        cost: 2700,
        zip: true,
        style: 'unisex',
      },

      'JH055': {
        name: 'Girlie Zoodie',
        cost: 2700,
        zip: true,
        style: 'womens',
      },
    };
  }
  
  // This method checks whether the given price
  // matches the given product code.
  checkPrice(prodCode, price) {
    return (this.hoodies[prodCode] === price);
  }

  // Generates an email given a product description, discount, orderID, and some stripe information
  createEmailContent(product, discount, orderId, stripeResponse) {
    var description = "";

    const hoodie = this.hoodies[product.code];

    if (hoodie.zip) {
      description += "Zipped hoodie, ";
    } else {
      description += "Regular hoodie, ";
    }

    description += `Order code ${product.code} in size ${hoodie.style} ${product.size} ` +
      `in ${product.hoodie_color} with ${product.logo_position} ${product.logo_color} logo ` +
      `and ${product.back_print_color} read printing.`
    
    if (product.custom_text !== "") {
      description += ` Custom text: "${product.custom_text}"`;
    }

    const email = {
      body: {
        title: "You've just bought a CompSoc hoodie!",
        intro: "We've recieved your order (detailed below) and will pass your customisations onto our supplier.",
        table: {
        data: [
            {
                item: 'CompSoc hoodie',
                description: description,
                price: '£' + (hoodie.cost/100)
            }
        ],
        columns: {
            customWidth: {
                item: '20%',
                price: '15%'
            },
            customAlignment: {
                price: 'right'
            }
        }
        },
        outro: [
          'That totalled up to <strong>£' + stripeResponse.amount/100 + "</strong> and the payment on your card ending " + stripeResponse.last4 + " was successful.",
          "Your order ID is <em>" + orderId + "</em> and your Stripe transaction ID is <em>" + stripeResponse.id + "</em>",
          'Please note down the above ID as we will need it to be able to resolve any problems.'
        ]
      }
    }

    // Add something to the email if we have a discount
    if (discount !== 0) {
      email.body.table.data.push({
        item: 'Discount code',
        description: 'Thank you for supporting CompSoc.',
        price: '- £' + discount/100
      });
    }

    return email;
  }
}

module.exports = HoodieUtils;