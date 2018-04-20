import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { PrivateKey } from 'bitsharesjs/es';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      masterWif: '',
      keys: {
        master: null,
        owner: null,
        active: null,
        memo: null
      },
      roles: ['active','memo','owner']
    }
    
    this.setMasterKey = this.setMasterKey.bind(this)
    this.changeForm = this.changeForm.bind(this)
    this.calculateDerive = this.calculateDerive.bind(this)
    this.submit = this.submit.bind(this)
  }

  changeForm(input) {
    this.setState(input)
    if (typeof input.masterWif !== 'undefined') {
      this.setMasterKey(input);
    }
  }

  submit() {
    if(this.state.masterWif !== '' && this.state.account !== '') {
      try {
        this.calculateDerive()
      } catch(e) {
        //not generated
      }
    }
  }

  setMasterKey(input) {
    this.setState({msg: ''});
    try {
      let master = PrivateKey.fromWif(input.masterWif)
      let masterKeys = {
        privKey: master.toWif(),
        pubKey: master.toPublicKey().toString()
      }
      this.setState({
        keys : {
          ...this.state.keys,
          master: masterKeys
        }
      });
    } catch(e) {
      console.log(e)
      this.setState({
        keys: {
          master: null,
          owner: null,
          active: null,
          memo: null
        },
        msg: 'Invalid WIF'
      })
    }
  }

  calculateDerive() {
    let keys = {}
    this.state.roles.map(role => {
      keys[role] = this.generateKeyFromPassword(
        this.state.account,
        role,
        this.state.keys.master.privKey
      )
    })
    this.setState({
      keys : {
        ...this.state.keys,
        ...keys
      }
    })
  }

  generateKeyFromPassword(accountName, role, password) {
    let seed = accountName + '-' + role + '-' + PrivateKey.fromSeed(password).toWif();
    let privKey = PrivateKey.fromSeed(seed);
    let pubKey = privKey.toPublicKey().toString();

    return {privKey: privKey.toWif(), pubKey, seed};
  }

  render() {
    return (
      <div className="App">
        <label>Account</label>
        <input type='text' onChange={ (e) => this.changeForm({account:e.target.value}) }/>

        <label>Master Wif</label>
        <input type='text' onChange={ (e) => this.changeForm({masterWif:e.target.value}) }/>
        <button onClick={this.submit}>Calculate</button>
        {this.state.msg}
        <div className="debug">
          <pre>
            {JSON.stringify(this.state.keys, null, '  ')}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;
