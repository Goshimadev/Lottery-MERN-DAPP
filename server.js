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
  res.send(result);
});

app.get('/get_total_amount', async (req, res) => {
  var result = await get_total_amount();
  res.send(result);
});

app.listen(3000, () => {
  console.log('server is running on port 3000');
});
