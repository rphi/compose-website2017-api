class HoodieUtils {
  constructor(){
    this.priceList = {
        'JH001': 2500,
        'JH01F': 2500,
        'JH050': 2700,
        'JH055': 2700
    }
  }
  
  checkPrice(prodCode, price) {
      if (this.priceList[prodCode] == price) { return true; }
      return false;
  }

  createEmailContent(product, discount, orderId, stripeResponse){
    var description = "";
    if (product.zip) {
        description += "Zippered hoodie (\"Zoodie\"), ";
    } else {
        description += "College hoodie, ";
    }
    description += "Order code " + product.code + 
                  " in size " + product.style + " " + product.size + 
                  " in " + product.colour +
                  " with " + product.logo_position + " " + product.logo_color + " logo" +
                  " and " + product.back_print_color + " rear printing.";
    
    if (product.name != "") {
      description += " Custom text: \"" + product.name + "\"";
    }

    var email = {
      body: {
        title: 'Congrats on your new CompSoc hoodie!',
        intro: 'We\'ve recieved your order (detailed below) and will pass your customisations onto our supplier',
        table: {
        data: [
            {
                item: 'CompSoc hoodie',
                description: description,
                price: '£' + (this.priceList[product.code]/100)
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
          'Hopefully everything looks right here, but if not, just let us know so that we can sort things out. Remember to include the ID above.'
        ]
      }
    }
    if (discount != 0) {
      email.body.table.data.push({
        item: 'Discount code',
        description: 'You used a coupon. Yay.',
        price: '- £' + discount/100
      });
    }
    return email;
  }
}

module.exports = HoodieUtils;