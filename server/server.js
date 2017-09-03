const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const crypto = require('crypto');
const bodyParser = require('body-parser');

// Priority serve any static files.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next(); 
});

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.resolve(__dirname, '../build')));

const encrypt = function(str, name, date, hash) {
  let currentDate = JSON.stringify(new Date);
  let currMonth = currentDate.slice(0,2);
  let currDay = currentDate.slice(2,4);
  let currYear = currentDate.slice(4,8);
  console.log(currentDate, currMonth, currYear);
  var key = crypto.createHash("sha256").update(hash, "ascii").digest();
  var iv = "1234567890123456";
  var cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  let encrypted = cipher.update(str,'utf8','hex') + 'l' + cipher.update(name, 'utf8', 'hex') + 'l' + cipher.update(date, 'utf8', 'hex');
  return encrypted;  
}

const decrypt = function(str, hash) {
  console.log(str);
  str = str.split('l');
  var key = crypto.createHash("sha256").update(hash, "ascii").digest();
  var iv = "1234567890123456";    
  var decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
  var decryptedMessage = decipher.update(str[0],'hex','utf8');
  var senderName = decipher.update(str[1],'hex','utf8');
  var expirationDate = decipher.update(str[2],'hex','utf8');
  return JSON.stringify({"decrypted":`${decryptedMessage}`, "senderName":`${senderName}`, "expirationDate":`${expirationDate}`}); 
}

//CONTINUE HERE!!!! 
const dateChange = function(value) {
  let date = JSON.stringify(value);
  let year = date.slice(1,5);
  let month = date.slice(6, 8);
  let day = date.slice(9, 11);
  let newDate = month+day+year;
  console.log(newDate)
}

// Answer API requests.
app.post('/encrypt', function (req, res) {
  let name = req.body.name;
  let message = req.body.message;
  let encryptKey = req.body.key;
  let date = req.body.date;
  console.log('encrypt success at Server.Js!', req.body);
  res.set('Content-Type', 'application/json');
  res.send({"message":"Hello from the custom server!", "encryption": `${encrypt(message, name, date, encryptKey)}` });
});

app.post('/decrypt', function (req, res) {
  let encryptedMessage = req.body.encryptedMessage;
  let decryptKey = req.body.key;
  console.log('decrypt success at Server.Js!', encryptedMessage, decrypt(encryptedMessage,decryptKey));
  res.set('Content-Type', 'application/json');
  res.send({"message":"App.post", "decryption": `${decrypt(encryptedMessage, decryptKey)}`});
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  console.log('app.get wild card')
  response.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
