const https = require('https');

const data = JSON.stringify({
  items: [{ id: "P101", price: 100, quantity: 1 }],
  customerDetails: {
    name: "Test Bot Vercel",
    email: "test@example.com",
    phone: "9999999999",
    shippingAddress: "Test Address, City, 123456",
    deliveryMethod: "delivery"
  },
  shippingFee: 0
});

const options = {
  hostname: 't-shop.vercel.app',
  port: 443,
  path: '/api/orders/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", responseBody);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
