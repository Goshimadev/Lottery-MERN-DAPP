const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {
  save_user_information,
  get_total_amount,
} = require('./models/server_db');
const path = require('path');
const publicPath = path.join(__dirname, './public');
const paypal = require('paypal-rest-sdk');

// handling all the parsing
app.use(bodyParser.json());
app.use(express.static(publicPath));

// paypal configuration
paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'AcYU7GEgzZOyWqha0pLtE68d3WWVGh7B2bH3gtYXUFOrWefIb77Sb89GXaWqJm_Nu24fJrFFjNt_Id9E',
  client_secret:
    'EMD-T6wfgXhy5WG284ihcrliEEwOgq6Hm54TmY0HrTLqfTHheeN1wgDwg_Rcnoh5g19EhpXUexrUANK2',
});

app.post('/post_info', async (req, res) => {
  var email = req.body.email;
  var amount = req.body.amount;

  if (amount <= 1) {
    return_info = {};
    return_info.error = true;
    return_info.message = 'The amount should be greater than 1';
    return res.send(return_info);
  }

  var result = await save_user_information({ amount: amount, email: email });

  var create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'Lottery',
              sku: 'Funding',
              price: amount,
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: amount,
        },
        payee: {
          email: 'lottery_manager@lotteryapp.co',
        },
        description: 'Lottery purchase',
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log('Create Payment Response');
      console.log(payment);
      for (var i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel == 'approval_url') {
          return res.send(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/get_total_amount', async (req, res) => {
  var result = await get_total_amount();
  res.send(result);
});

app.listen(3000, () => {
  console.log('server is running on port 3000');
});
