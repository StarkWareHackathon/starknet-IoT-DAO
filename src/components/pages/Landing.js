import React, { useState, useContext, useEffect } from 'react';
import Particle from '../components/Particle';
import SliderMainParticle from '../components/SliderMainParticle';

import { createGlobalStyle } from 'styled-components';
import Footer from '../components/Footer';
import FeatureBox from '../components/FeatureBox';

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector'
import { AccountContext } from '../../state/contexts/AccountContext';

const GlobalStyles = createGlobalStyle`
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  .navbar .mainside a{
    background: #8364e2;
    &:hover{
      box-shadow: 2px 2px 20px 0px #8364e2;
    }
  }
  .item-dropdown{
    .dropdown{
      a{
        &:hover{
          background: #8364e2;
        }
      }
    }
  }
  .btn-main{
    background: #8364e2;
    &:hover{
      box-shadow: 2px 2px 20px 0px #8364e2;
    }
  }
  p.lead{
    color: #a2a2a2;
  }
  .navbar .navbar-item .lines{
    border-bottom: 2px solid #8364e2;
  }
  .jumbotron.no-bg{
    height: 100vh;
    overflow: hidden;
    background-repeat: repeat;
    background-size: cover;
    background-position: bottom;
    background-repeat: no-repeat;
  }
  #tsparticles{
    top: 0;
  }
  .text-uppercase.color{
    color: #8364e2;
  }
  .de_count h3 {
    font-size: 36px;
    margin-bottom: 0px;
  }
  .de_count h5{
    font-size: 14px;
    font-weight: 500;
  }
  h2 {
    font-size: 30px;
  }
  .box-url{
    text-align: center;
    h4{
      font-size: 16px;
    }
  }
  .de_countdown{
    border: solid 2px #8364e2;
  }
  .author_list_pp, .author_list_pp i, 
  .nft_coll_pp i, .feature-box.style-3 i, 
  footer.footer-light #form_subscribe #btn-subscribe i, 
  #scroll-to-top div{
    background: #8364e2;
  }
  footer.footer-light .subfooter .social-icons span i{
    background: #403f83;
  }
  .author_list_pp:hover img{
    box-shadow: 0px 0px 0px 2px #8364e2;
  }
  .nft__item_action span{
    color: #8364e2;
  }
  .feature-box.style-3 i.wm{
    color: rgba(131,100,226, .1);
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const Landing = () => {

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 4690],
  })

  const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();

  const { globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId } = useContext(AccountContext);

  useEffect(() => {
    setGlobalAccount(account);
    setGlobalActive(active);
    setGlobalChainId(chainId);
  }, [account, active, chainId])

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

  return (
    <div>
      <GlobalStyles />
      <section className="jumbotron no-bg" style={{ backgroundImage: `url(${'./img/background/8.jpg'})` }}>
        <Particle />
        <SliderMainParticle />
      </section>

      <section className='container no-bottom'>
        <div className="row">
          <div className="col-lg-2 col-sm-4 col-6 mb30" >
            <span className="box-url" onClick={connect}>

              <img src="./img/wallet/1.png" alt="" className="mb20" />

              <h4>Metamask {active && <span>{`${account.slice(0, 5)}...${account.slice(-4)}`}</span>}</h4>
            </span>
          </div>

          <div className="col-lg-2 col-sm-4 col-6 mb30">
            <span className="box-url">
              <img src="./img/wallet/2.png" alt="" className="mb20" />
              <h4>Bitski</h4>
            </span>
          </div>

          <div className="col-lg-2 col-sm-4 col-6 mb30">
            <span className="box-url">
              <img src="./img/wallet/3.png" alt="" className="mb20" />
              <h4>Fortmatic</h4>
            </span>
          </div>

          <div className="col-lg-2 col-sm-4 col-6 mb30">
            <span className="box-url">
              <img src="./img/wallet/4.png" alt="" className="mb20" />
              <h4>WalletConnect</h4>
            </span>
          </div>

          <div className="col-lg-2 col-sm-4 col-6 mb30">
            <span className="box-url">
              <img src="./img/wallet/5.png" alt="" className="mb20" />
              <h4>Coinbase</h4>
            </span>
          </div>

          <div className="col-lg-2 col-sm-4 col-6 mb30">
            <span className="box-url">
              <img src="./img/wallet/6.png" alt="" className="mb20" />
              <h4>Arkane</h4>
            </span>
          </div>
        </div>
      </section>

      <section className='container no-top'>
        <div className='row'>
          <div className="spacer-double"></div>
          <div className='col-lg-12 mb-3'>
            <h2>Mint and Participate</h2>
          </div>
          <FeatureBox />
        </div>
      </section>

      <Footer />
    </div>
  )
};
export default Landing;