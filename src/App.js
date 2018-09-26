import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import ipfs from './ipfs'
import './App.css'
import TodoItems from "./TodoItems";

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'

//React uses components to manage every part of code
//This is how they encapsulate code. React gives a way to couple
//logic with the markup - render is where it's actuall writing the markup
class App extends Component 
{
  constructor(props) 
  {
    super(props)

    //ivars and struct we're using
    this.state = {
      ipfsHash: '',
      web3: null,
      buffer: null,
      account: null,
      items: [] 
    }
    //this is to make calling the function on the objects easier to read
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.addItem = this.addItem.bind(this); 
    this.deleteItem = this.deleteItem.bind(this);
}

  componentWillMount() 
  {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    
//This utility came for free with trufflebox
/*

blockchain enabled client side DAPP - this us to talk to smart contracts directly
and read/write data to blockchain directly
*/
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() 
  {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience they're placed here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Get the accounts 
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        this.simpleStorageInstance = instance
        this.setState({ account: accounts[0] })
        // Get the value from the contract to prove it worked, along with the hash
        return this.simpleStorageInstance.get.call(accounts[0])
      }).then((ipfsHash) => {
        // Update state with the result.
        return this.setState({ ipfsHash })
      })
    })
  }

  //method to 
  captureFile(event) 
  {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  //write to blockchain after writing to IPFS
  onSubmit(event) {
    event.preventDefault()
    ipfs.files.add(this.state.buffer, (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      
      this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
        return this.setState({ ipfsHash: result[0].hash })
        console.log('ipfsHash', this.state.ipfsHash)
        })
/*

  code before going with the above

      this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
      return this.setState({ ipfsHash: result[0].hash })
      console.log(this.state.ipfsHash)
      */
    
    })
  }  
    /*
      this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
        return this.setState({ ipfsHash: result[0].hash })
        console.log('ipfsHash', this.state.ipfsHash)
        })
  
*/

//method to add items to the list
addItem(e) {
    var itemArray = this.state.items;

    if (this._inputElement.value !== "") {    
      itemArray.unshift(
        {      
          text: this._inputElement.value,      
          key: Date.now()    
        }
      );

      this.setState({      
        items: itemArray    
      });   

      this._inputElement.value = "";  
    }   
    console.log(itemArray);   
    e.preventDefault();
  }

  //method to delete item from the list on click
  deleteItem(key) {  
    var filteredItems = this.state.items.filter(function (item) {    
      return (item.key !== key);  
    }); 

    this.setState({    
      items: filteredItems  
    });
  }

  //page template
  render() 
  {
    return (

        <div className="App">

          <nav className="navbar pure-menu pure-menu-horizontal">
            <img src="/vandelay_industries.jpeg" alt="img" width="128" height="120" ></img>

            <a href="#" className="pure-menu-heading pure-menu-link">File Upload DApp Using IPFS</a>
            </nav>

            <main className="container">

               <div className="pure-g">
                <div className="pure-u-1-1">
                      
                  <div className="taskContainer">
                   <form onSubmit={this.addItem}>            
                      <input ref={(a) => this._inputElement = a} 
                        placeholder="enter task">
                    </input>            
                     <button type="submit">add</button>          
                       </form>  
                        <TodoItems entries={this.state.items} 
                  delete={this.deleteItem}/> 
                  </div>

              <h1>Image</h1>

                <p>The uploaded image will be stored on IPFS and the Ethereum Blockchain</p>
                  <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>

                <h2>Upload Image</h2>
                  <form onSubmit={this.onSubmit} >
                    <input type='file' onChange={this.captureFile} />
                      <input type='submit' />

                  </form>
                </div>
            </div>
         </main>
        </div>
      );
    }
  }

  export default App



