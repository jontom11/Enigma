import React, {Component} from 'react';
import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button/Button';
import crypto from 'crypto';
// const crypto = require('crypto');

class Crypto extends Component {
  constructor () {
    super();
    this.state={message:'', key:''};

    this.clickHandler = this.clickHandler.bind(this);
    this.changeMessageHandler = this.changeMessageHandler.bind(this);
    this.changeKeyHandler = this.changeKeyHandler.bind(this);
    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }

  encrypt() {
    var text = 'crypto is awesome!';
    var key = crypto.createHash("sha256").update("hound", "ascii").digest();
    var iv = "1234567890123456";
    var cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
    let encrypted = cipher.update(text,'utf8','hex');
    return encrypted;  
  }

  decrypt(Encrypted) {
  console.log(this.state.key)
    var encrypted = 'fab5bb3be0ee9641c082eae5b46c7d714a85';
//     var key = crypto.createHash("sha256").update(this.state.key, "ascii").digest();
    var key = crypto.createHash("sha256").update("hound", "ascii").digest();
    var iv = "1234567890123456";    
    var decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
    var decrypted = decipher.update(encrypted,'hex','utf8')
    return decrypted;
  }

  clickHandler() {
    console.log(this.encrypt());
    console.log(this.decrypt());
  }

  changeMessageHandler (value) {
    this.setState({message: value})
  }

  changeKeyHandler(value) {
    this.setState({key: value})
  }

  render () {
    return (
      <div>
        Hello!
        <div>
          <Input label='message' style={{width: '450px', margin: '0 auto'}} value={this.state.message} onChange={this.changeMessageHandler}/>
          <Input label='hash' style={{width: '450px', margin: '0 auto'}} value={this.state.key} onChange={this.changeKeyHandler}/>
          <Button label='submit' onMouseUp={this.clickHandler}/>
        </div>
      </div>
    )
  }
}

export default Crypto;