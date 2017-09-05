const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const crypto = require('crypto');
const bodyParser = require('body-parser');

// Priority serve any static files.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next(); 
});

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.resolve(__dirname, '../build')));

//returns boolean whether expiration date is beyond current date
const dateChecker = (expirationDate) => {
  let currentDate = JSON.stringify(new Date);
  let currMonth = currentDate.slice(6, 8);
  let currDay = currentDate.slice(9, 11);
  let currYear = currentDate.slice(1, 5);
  let exMonth = expirationDate.slice(0, 2);
  let exDay = expirationDate.slice(2, 4);
  let exYear = expirationDate.slice(4, 8);
  if (currYear < exYear) {
    return true;
  } else if (currYear = exYear) {
    if (currMonth < exMonth) {
      return true;
    } else if (currMonth = exMonth) {
      if (currDay <= exDay) {
        return true;
      }
    } 
  }
  return false;
}

const encrypt = (str, name, date, hash) => {
  let expiredBoolean = dateChecker(date);
  let salt = 'jOnToM1';
  let key = crypto.createHash("sha256").update(hash+salt, "ascii").digest();
  let iv = "1234567890123456";
  let cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  let encrypted = cipher.update(str,'utf8','hex') + 'l' + cipher.update(name, 'utf8', 'hex') + 'l' + cipher.update(date, 'utf8', 'hex');
  return encrypted;  
}

const decrypt = (str, hash) => {
  // name, message, and date are split by 'l' in the encrypted message
  str = str.split('l');
  let salt = 'jOnToM1';
  let key = crypto.createHash("sha256").update(hash+salt, "ascii").digest();
  let iv = "1234567890123456";    
  let decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
  let decryptedMessage = decipher.update(str[0],'hex','utf8');
  let senderName = decipher.update(str[1],'hex','utf8');
  let expirationDate = decipher.update(str[2],'hex','utf8');
  let withinDate = dateChecker(expirationDate);
  return JSON.stringify({"decrypted":`${decryptedMessage}`, "senderName":`${senderName}`, "expirationDate":`${expirationDate}`, "withinDate":`${withinDate}`}); 
}

// Answer API requests.
app.post('/encrypt', (req, res) => {
  let name = req.body.name;
  let message = req.body.message;
  let encryptKey = req.body.key;
  let date = req.body.date;
  console.log('encrypt success at Server.Js!', req.body);
  res.set('Content-Type', 'application/json');
  res.send({"message":"Hello from the custom server!", "encryption": `${encrypt(message, name, date, encryptKey)}` });
});

app.post('/decrypt', (req, res) => {
  let encryptedMessage = req.body.encryptedMessage;
  let decryptKey = req.body.key;
  console.log('decrypt success at Server.Js!', encryptedMessage, decrypt(encryptedMessage,decryptKey));
  res.set('Content-Type', 'application/json');
  res.send({"message":"App.post", "decryption": `${decrypt(encryptedMessage, decryptKey)}`});
});

// All remaining requests return the React app, so it can handle routing.
app.get('*',(request, response) => {
  console.log('app.get wild card')
  response.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
