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
    return (this.hoodies[prodCode].cost === price);
  }

  // Generates an email given a product description, discount, orderID, and some stripe information
  createEmailContent(product, discount, orderId, stripeResponse) {
    const hoodie = this.hoodies[product.code];
    const description = `Hoodie ${product.code} in size ${hoodie.style} ${product.size}.`;

    const email = {
      body: {
        title: "You've just bought a CompSoc hoodie!",
        intro: "We'll let you know when you can pick up your hoodie.",
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
          `Your order ID is <em>${orderId}</em> and your Stripe transaction ID is <em>${stripeResponse.id}</em>.`,
        ]
      }
    }

    // Add something to the email if we have a discount
    if (discount !== 0) {
      email.body.table.data.push({
        item: 'Discount code',
        description: 'Thank you for supporting CompSoc.',
        price: '- £' + (discount/100)
      });
    }

    return email;
  }
}

module.exports = HoodieUtils;