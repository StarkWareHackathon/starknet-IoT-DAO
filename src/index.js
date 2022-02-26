import React from 'react';
import ReactDOM from 'react-dom';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';

import "./assets/animated.css";
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './assets/style.scss';
import App from './components/App';

import { Provider } from 'react-redux'
import store from './store';

import reportWebVitals from './reportWebVitals';

function getLibrary(provider) {
  return new Web3(provider)
}

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
  <Provider store={store}>
		<App />
	</Provider>
  </Web3ReactProvider>
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
