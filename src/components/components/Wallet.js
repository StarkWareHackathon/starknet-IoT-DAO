import React from 'react';
import { connect } from 'react-redux';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector'


const Wallet= () => {
    
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42],
      })

    const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();
    
    async function connect() {
        try {
          await activate(injected)
        } catch (ex) {
          console.log(ex)
        }
      }
    
      async function disconnect() {
        try {
          deactivate()
        } catch (ex) {
          console.log(ex)
        }
      }
      
    return(
  <div className="row">
    <div className="col-lg-3 mb30">
        <button onClick={connect}>test button</button>
        <span id = "MetamaskConnect" className="box-url">
            <span className="box-url-label">Most Popular</span>
            <img src="./img/wallet/1.png" alt="" className="mb20"/>
            <h4>Metamask {account.slice(0,5)}</h4>
            <p>Start exploring blockchain applications in seconds.  Trusted by over 1 million users worldwide.</p>
        </span>
        
    </div>

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <img src="./img/wallet/2.png" alt="" className="mb20"/>
            <h4>Bitski</h4>
            <p>Bitski connects communities, creators and brands through unique, ownable digital content.</p>
        </span>
    </div>       

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <img src="./img/wallet/3.png" alt="" className="mb20"/>
            <h4>Fortmatic</h4>
            <p>Let users access your Ethereum app from anywhere. No more browser extensions.</p>
        </span>
    </div>    

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <img src="./img/wallet/4.png" alt="" className="mb20"/>
            <h4>WalletConnect</h4>
            <p>Open source protocol for connecting decentralised applications to mobile wallets.</p>
        </span>
    </div>

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <img src="./img/wallet/5.png" alt="" className="mb20"/>
            <h4>Coinbase</h4>
            <p>The easiest and most secure crypto wallet. ... No Coinbase account required.
            </p>
        </span>
    </div>

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <img src="./img/wallet/6.png" alt="" className="mb20"/>
            <h4>Arkane</h4>
            <p>Make it easy to create blockchain applications with secure wallets solutions.</p>
        </span>
    </div>       

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <img src="./img/wallet/7.png" alt="" className="mb20"/>
            <h4>Authereum</h4>
            <p>Your wallet where you want it. Log into your favorite dapps with Authereum.</p>
        </span>
    </div>    

    <div className="col-lg-3 mb30">
        <span className="box-url">
            <span className="box-url-label">Most Simple</span>
            <img src="./img/wallet/8.png" alt="" className="mb20"/>
            <h4>Torus</h4>
            <p>Open source protocol for connecting decentralised applications to mobile wallets.</p>
        </span>
    </div>                                  
</div>
)};
export default Wallet;