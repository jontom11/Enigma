import React, {Component} from 'react';
import Button from 'react-toolbox/lib/button/Button';
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card';
import theme from './toolbox/theme';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker/DatePicker';
import axios from 'axios';
import queryString from 'querystring';
import Dialog from 'react-toolbox/lib/dialog/Dialog';


class CardSpot extends Component {
  constructor () {
    super();
    this.state = {
      name: '', 
      message: '', 
      encrypted:'Encryption will show here', 
      key:'',
      date: '', 
      showDate: '',
      active: false, 
      active2: false, 
      decryptMessage:''};

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handledMessageChange = this.handledMessageChange.bind(this);
    this.encryptMessage = this.encryptMessage.bind(this);
    this.decryptMessage = this.decryptMessage.bind(this);
    this.newKey = this.newKey.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleToggle2 = this.handleToggle2.bind(this);
    this.handleDecryptMessageChange = this.handleDecryptMessageChange.bind(this);
  }

  encryptMessage() {
    var that = this;
    let data = queryString.stringify({
      "name":`${this.state.name}`,
      "message": `${that.state.message}`,
      "date": `${that.state.date}`,
      "key": `${window.location.hash}`
    })
    axios.post('/encrypt', data)
    .then(function (response) {
      that.setState({encrypted: response.data.encryption})
      console.log(response.data.encryption); 
      that.handleToggle2();
    })
    .catch(function (error) {
      that.setState({message: "The message has either expired or is an invalid encrypted message."});
      that.handleToggle2();
      console.log(error);
    });
  }

  decryptMessage() {
    var that = this;
    var data = queryString.stringify({
      "encryptedMessage": `${that.state.decryptMessage}`,
      "key":`${window.location.hash}`
    });
    axios.post('/decrypt', data)
    .then(function (response) {
      var parse = JSON.parse(response.data.decryption)
      console.log(parse.withinDate)
      // translating new Date Object back into Readable form for React-Tool Calendar
      var showThisDate = parse.expirationDate;
      let exMonth = showThisDate.slice(0, 2);
      let exDay = showThisDate.slice(2, 4);
      let exYear = showThisDate.slice(4, 8);
      showThisDate = new Date(exYear,exMonth-1,exDay);
      // if date passes, set state
      if (parse.withinDate === 'true') {
        that.setState({
          encrypted: parse.decrypted, 
          message: parse.decrypted, 
          name: parse.senderName,
          date: parse.expirationDate,
          showDate: showThisDate
        })
      } else {
        that.setState({
          encrypted: '', 
          message: 'The message has either expired or is an invalid encrypted message.', 
          name: '',
          date: '',
          showDate: ''
        })
      }
      console.log(response.data, parse);
      that.handleToggle();
    })
    .catch(function (error) {
        that.setState({
          encrypted: '', 
          message: 'The message has either expired or is an invalid encrypted message.', 
          name: '',
          date: '',
          showDate: ''
        });      
        that.handleToggle();
      console.log(error);
    });
  }
  
  //function to create new passphrases
  newKey() {
    let choice = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    var key = '';
    for (var i = 0; i < 5; i++) {
      key += choice[ Math.floor(Math.random()*choice.length)];
    }
    this.setState({key: key})
    window.location.hash = key;
  }
  
  //handles Encrypt toggle
  handleToggle() {
    this.setState({active: !this.state.active});
  }
   
  //handles decrypt toggle
  handleToggle2() {
    this.setState({active2: !this.state.active2});
  }
  
  handleNameChange(value) {
    this.setState({name: value})
  }

  handledMessageChange(value) {
    this.setState({message: value})
  }
  
  handleDecryptMessageChange(value) {
    this.setState({decryptMessage: value})
  }
  
  // translates date object (pulled from date picker) into a string
  handleDateChange(value) {
    let date = JSON.stringify(value);
    let year = date.slice(1,5);
    let month = date.slice(6, 8);
    let day = date.slice(9, 11);
    let newDate = month+day+year;
    this.setState({date: newDate})
    this.setState({showDate:value})
  }

  render() {

    // sets min date for date Picker to today's date
    const datetime = new Date();
    const min_datetime = new Date(new Date(datetime));
    
    return (
      <div>
        <div>  
          <Card style={{width: '500px', margin: '0 auto', padding:'10px'}}>
            <CardTitle 
              title="Jonathan's Enigma"
              subtitle="Ensure your Hash URL is correct!"
            />
            <CardMedia
              aspectRatio="wide"
              image="https://placeimg.com/800/450/nature"
            />
            <CardText>
              <Input type='text' label='Name' value={this.state.name} onChange={this.handleNameChange} maxLength={16} />
              <Input multiline='true' type='text' label='Message' value={this.state.message} onChange={this.handledMessageChange} maxLength={120} />
             
              <DatePicker label='Expiration date' 
              sundayFirstDayOfWeek 
              minDate={min_datetime} 
              onChange={this.handleDateChange} 
              value={this.state.showDate}
              autoOk='true' 
              />

            </CardText>
            <CardActions theme={theme}>     

              {/*Creating a toggle box for the encryted message*/}
              <Button raised label='Encrypt' onClick={this.encryptMessage} />
              <Dialog
                actions={[
                  { label: "OK", onClick: this.handleToggle2.bind(this) },
                ]}
                active={this.state.active2}
                onEscKeyDown={this.handleToggle2}
                onOverlayClick={this.handleToggle2}
                title='Encrypted Message'
              >
                <h5>Copy the code and Passphrase, careful not to copy the whitespace at the end of the code.</h5>
                <p id="encryptMessage">{this.state.encrypted}</p>
              </Dialog>

              {/*Creating a toggle box for the decrypted message*/}
              <Button raised label='Decrypt' onClick={this.handleToggle} />
              <Dialog
                actions={[
                  { label: "Cancel", onClick: this.handleToggle.bind(this) },
                  { label: "Decrypt", onClick: this.decryptMessage.bind(this) }
                ]}
                active={this.state.active}
                onEscKeyDown={this.handleToggle}
                onOverlayClick={this.handleToggle}
                title='Decrypt'
              >
                <h5>Input the encrypted message below and ensure the passphrase is correct for the hash url.</h5>
                <Input multiline='true' type='text' label='Encrypted Message' value={this.state.decryptMessage} onChange={this.handleDecryptMessageChange} />
              </Dialog>
              <Button raised label="Change Passphrase" onMouseDown={()=>this.newKey()}/>
            </CardActions>
            <div><h3>Your Passphrase - {window.location.hash}</h3></div>
          </Card>     
        </div>
      </div>
    )
  }
}

export default CardSpot; 

