import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
import Navbar from './Navbar';
import Marketplace from '../abis/Marketplace.json';
import Main from './Main';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Determine which network MetaMask is connected to
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if (networkData) {
      // Instantiate contract with Web3.js
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })
      const productCount = await marketplace.methods.productCount().call()
        this.setState({ productCount })
        // Load products
        for (var i = 1; i <= productCount; i++) {
          const product = await marketplace.methods.products(i).call()
          this.setState({
            products: [...this.state.products, product]
          })
        }
      console.log(productCount.toString())
      this.setState({ loading: false })
    } else {
      window.alert('Marketplace contract not deployed to detected network!')
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  createProduct(name, price) {
    // Tell React that our app is "loading"
    this.setState({ loading: true })
    // Tells Web3 that current account is the user that's calling it
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
    // Once txn receipt has been recieved, remove app from "loading" state
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
      /* Don't understand why cannot do the following:
      Now let's render it out on the page.
      First, delete all the old Navbar code, and replace it with this:
      <Navbar account={this.state.account} />
      */
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blockchain Marketplace
          </a>
          <Navbar account={this.state.account} />
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
          <main role="main" className="col-lg-12 d-flex">
            { this.state.loading
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
              : <Main
                products={this.state.products}
                createProduct={this.createProduct}
                purchaseProduct={this.purchaseProduct} />
            }
          </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
