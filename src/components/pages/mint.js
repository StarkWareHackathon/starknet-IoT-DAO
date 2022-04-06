import InsuranceNFT from '../../abis/InsuranceNFT.json';
import Verify from '../../abis/Verify.json';
import InsuranceDAO from '../../abis/InsuranceDAO.json';
import React, { useState, useContext, useEffect, useMemo } from "react";
import Footer from '../components/Footer';
import { useWeb3React } from "@web3-react/core";
import { AccountContext } from '../../state/contexts/AccountContext';
import { useInsuranceNftContract } from '../../state/hooks/useInsuranceNftContractInvoke';
import { useNftContract } from '../../state/hooks/useNftContract';
import { useInsuranceDAOMintContract } from '../../state/hooks/useDAOMintContract';
import { useGetTokenFromAddress } from '../../state/hooks/useGetTokenFromAddress'
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { formatEther } from '@ethersproject/units';
import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

import {
  StarknetProvider,
  useContract,
  useStarknetBlock,
  useStarknetCall,
  useStarknetInvoke,
  useStarknetTransactionManager,
  Transaction,
  useStarknet,
  InjectedConnector,
  useMulticall
} from '@starknet-react/core'

import { toBN } from 'starknet/dist/utils/number'

import { bnToUint256, uint256ToBN } from 'starknet/dist/utils/uint256'

const Web3 = require('web3');

const Mint = function () {
  const [files, setFiles] = useState([]);
  const [fileURL, setFileURL] = useState("");
  const [start, setStart] = useState(0);
  const [dateTime, setDateTime] = useState("");
  const [currentImageURI, setCurrentImageURI] = useState("");
  const [amountRuns, setAmountRuns] = useState(100);
  const [penaltyLevels, setPenaltyLevels] = useState([]);
  const [accLevels, setAccLevels] = useState([]);
  const [costLevels, setCostLevels] = useState([]);
  const [VerifyContract, setVerifyContract] = useState();
  const [DAOContract, setDAOContract] = useState();
  const [deviceIMEI, setDeviceIMEI] = useState();
  const [score, setScore] = useState(0);
  const [rating, setRating] = useState("");
  const [average, setAverage] = useState("");
  const [pendingTokenURI, setPendingTokenURI] = useState("");
  const [hexedTokenUri, setHexedTokenUri] = useState("");
  const [pendingTimeStamp, setPendingTimeStamp] = useState(0);
  const [r, setR] = useState("");
  const [s, setS] = useState("");
  const [v, setV] = useState(0);
  const [ratingBreaks, setRatingBreaks] = useState([]);
  const [ratingLabels, setRatingLabels] = useState([]);
  const [daoJoin, setDAOJoin] = useState(false);
  const [daoUpdate, setDAOUpdate] = useState(false);
  const [daoShow, setDAOShow] = useState(false);
  const [daoRating, setDAORating] = useState("");
  const [daoLevel, setDAOLevel] = useState(0);
  const [pendingMint, setPendingMint] = useState(false);

  const [currentTokenId, setCurrentTokenId] = useState('');

  const { globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId } = useContext(AccountContext);
  const myAddress = '0x03ceac5dd4b48f61d6680d3d16adf504ba3dadff55f4eb2389cadbde9731464d';
  const insuranceNftAddress = '0x022a3539a4e8f029819b74d24d0f88a75750b948359bb50123f195518749167d';
  const { account, library } = useStarknet()
  const { contract : nftCon, loading : nftLoad, error: nftError} = useNftContract()
  const { contract : daoMintCont, loading: daoMintLoad, error : daoMintError} = useInsuranceDAOMintContract();


  const { invokeInsuranceNftMint, invokeSetTokenUri } = useInsuranceNftContract(account, nftCon);

  const { data: getLastTokenId, error: getLastTokenIdError } = useStarknetCall({ nftCon, method: 'getLastTokenId', args: [account] })
  const { data: tokenURI, error: tokenURIError } = useStarknetCall({ nftCon, method: 'tokenURI', args: [[getLastTokenId && getLastTokenId[0].low.toString(), getLastTokenId && getLastTokenId[0].high.toString()]] })


  if (getLastTokenId) {
    if (tokenURI && !hexedTokenUri) {
      const uriToHex = tokenURI[0][1] + tokenURI[0][2]
      const hexUri = new Buffer(uriToHex).toString('hex')
      setHexedTokenUri(hexUri)
    }
  }

  useEffect(() => {
    const loadLabels = async () => {
      const labelResponse = await fetch(`/labels`);
      const labelBody = await labelResponse.json();
      setRatingLabels(labelBody.results.labels);
      setCostLevels(labelBody.results.costs);
      setRatingBreaks(labelBody.results.ratings);
      setAccLevels(labelBody.results.accLevels);
      setPenaltyLevels(labelBody.results.penLevels);
    }
    loadLabels();
  }, [])

  useEffect(() => {
    const loadUserNFTData = async () => {
      if (account) {
        const response = await fetch(`/user-nfts/${account}`);
        const body = await response.json();
        const initResponse = await fetch(`/init-device-check/${account}`);
        const initBody = await initResponse.json();
        const yearAgo = Math.round(Date.now() / 1000) - 12 * 30 * 24 * 3600;
        if (body.start !== 0 && body.start > yearAgo) {
          setStart(body.start);
          setDateTime(dateTimeUnixConverter(Number(body.start) + 60, true));
        }
        else {
          setStart(0);
          setDateTime(dateTimeUnixConverter(Math.round(Date.now() / 1000), true));
        }
        if (initBody.IMEI == "") {
          setDeviceIMEI("");
        }
        else {
          setDeviceIMEI(initBody.IMEI);
        }
      } else {
        setStart(0);
        setDateTime(dateTimeUnixConverter(Math.round(Date.now() / 1000), true));
        setDeviceIMEI("");
      }

      setFiles([]);
      setFileURL("");
      setScore(0);
      setRating("");
      setAverage("");
      setPendingTokenURI("");
      setPendingTimeStamp(0);
      setR("");
      setS("");
      setV(0);
      setPendingMint(false);
    }

    loadUserNFTData()
      .catch(console.error);

  }, [account])

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (InsuranceNftAbi) {

        let lastTokenURI, lastMetaData, lastMetaDataBody;
        if (hexedTokenUri && false) {
          // lastTokenURI = await NFTContract.methods.tokenURI(ownedNFTs[ownedNFTs.length - 1]).call();
          lastMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${hexedTokenUri}`);
          lastMetaDataBody = await lastMetaData.json();

        }
        
      } else {
        
      }
    }

    loadBlockchainData()
      .catch(console.error);

  }, [account, library])


  function fileLoad(e) {
    var newFiles = e.target.files;
    console.log(newFiles);
    var filesArr = Array.prototype.slice.call(newFiles);
    console.log(filesArr);
    setFiles([...filesArr]);
    setFileURL(URL.createObjectURL(newFiles[0]));
  }

  const imageMap = {
    "0x7f5ed1b71b101d046244ba6703a3bae5cfb2a5b34af4a841537f199974406d9": "author-1", "0x6fb00605dff8c1086aa8cea1307f82279d7df741ce588e775303ac47c1690e8": "author-2",
    "0x51df3b3b48329cd68512c1079db368685c5e527f3b9655246023d451207fed1": "author-3", "0x7da3d9da8b703afc89aa2c58ef5139de12a2dfdeca54be9b2e2711a98bb8328": "author-4"
  }

  function dateTimeUnixConverter(time, unixTime) {
    if (unixTime) {
      //convert to datetime
      var date = new Date(time * 1000);
      return `${date.getFullYear()}-${date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`}-${date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`}T${date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`}`
    }
  }

  function displayStart(time) {
    var date = new Date(time * 1000);
    let hours;
    const modifier = (date.getHours < 12 ? "AM" : "PM");
    if (date.getHours() === 0 || date.getHours() === 12) {
      hours = 12;
    }
    else {
      hours = date.getHours() % 12;
    }
    return `${date.getFullYear()}-${date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`}-${date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`} ${hours < 10 ? `0${hours}` : `${hours}`}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`} ${modifier}`
  }

  const startMint = async () => {
    if (!account) {
      window.alert("connect with wallet");
      return;
    }
    if (files.length === 0) {
      window.alert("upload an image before minting");
      return;
    }
    const file = files[0];
    if (!(['jpg', 'png', 'gif', 'mp4'].includes(file.name.slice(-3).toLowerCase())) && file.name.slice(-4).toLowerCase() !== 'webp') {
      window.alert("incorrect file extension");
      return;
    }
    const startMint = Math.round(Number(Date.parse(dateTime)) / 1000);
    if (start === 0) {
      if (startMint < (Math.round(Date.now() / 1000) - 12 * 30 * 24 * 3600)) {
        window.alert('must choose a start time within past year!');
        return;
      }
    }
    else if (start > startMint) {
      window.alert('choose a start time after timestamp of your last data used in NFTs!');
      return;
    }
    if (!(amountRuns >= 100 && amountRuns <= 500)) {
      window.alert('number of data points from pebble tracker must be between 100 and 500');
      return;
    }

    //adding file that was uploaded with name avatar (name doesn't really matter)
    const formData = new FormData();
    formData.append('avatar', file);

    // window.alert('made it here before post')
    //use axios to post image with multer and upload to pinata
    const mintImageRes = await axios.post(`/mint-upload/${account}`, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    });

    //set URI of uploaded image from pinata
    setCurrentImageURI(mintImageRes.data.imageURL);

    //call mint function with start, runs, and image URI
    const mintRes = await fetch(`/mint/${account}?runs=${amountRuns}&start=${startMint}&imageuri=${mintImageRes.data.imageURL}`);
    const mintBody = await mintRes.json();
    if (mintBody.reason) {
      window.alert(mintBody.reason);
      return;
    }
    else {
      setScore(mintBody.score);
      setRating(mintBody.rating);
      setAverage(mintBody.average);
      setPendingTokenURI(mintBody.tokenURI);
      setPendingTimeStamp(mintBody.lastTimeStamp);
      setR(mintBody.r);
      setS(mintBody.s);
      setV(mintBody.v);
      setPendingMint(true);
      window.alert(`score is ${mintBody.score}, average is ${mintBody.average}, last time stamp is ${mintBody.lastTimeStamp}, tokenURI is ${mintBody.tokenURI}, rating is ${mintBody.rating}`)
      return;
    }
  }

  //after all the calculations for score and rating and getting a token URI, proceed to mint NFT if user desires
  const finishMint = async () => {
    invokeInsuranceNftMint(hexedTokenUri)
  }

  const joinUpdateDao = async () => {
    if (daoJoin || daoUpdate) {
      const lastMetaData = await fetch(`dao-join-update/${account}`);
      const lastMetaDataBody = await lastMetaData.json();
      if (lastMetaDataBody.reason) {
        window.alert(lastMetaDataBody.reason);
        return;
      }
      const level = lastMetaDataBody.level;
      const tokenId = lastMetaDataBody.tokenId;
      const timeStamp = lastMetaDataBody.timeStamp;
      const r = lastMetaDataBody.r;
      const s = lastMetaDataBody.s;
      const v = lastMetaDataBody.v;
      let value = 0;
      if (daoJoin) {
        const costs = await DAOContract.methods.getCosts().call();
        value = costs[level - 1];
      }

      await DAOContract.methods.addToDao(level, tokenId, timeStamp, r, s, v).send({ from: account, value: value })
        .on('receipt', async function (receipt) {
          setDAOJoin(false);
          setDAOUpdate(false);
          setDAOShow(false);
          setDAOLevel(0);
          setDAORating("");
        })
    }
    else {
      setDAOJoin(false);
      setDAOUpdate(false);
      setDAOShow(false);
      setDAOLevel(0);
      setDAORating("");
      return;
    }
  }

  return (
    <div>

      <section className='jumbotron breadcrumb no-bg'>
        <div className='mainbreadcrumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Mint</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='container' style={{ paddingBottom: "0.1em" }}>
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <form id="form-create-item" className="form-border" action="#">
              <div className="field-set">
                <h5>Upload file</h5>

                <div className="d-create-file">
                  {files.length === 0 && <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>}
                  {files.map((x, index) =>
                    <p key={`${index}`}>{x.name}</p>
                  )}
                  <div className='browse'>
                    <input type="button" id="get_file" className="btn-main" value="Browse" />
                    <input id='upload_file' type="file" onChange={fileLoad} />
                  </div>

                </div>

                <div className="spacer-single"></div>

                <h5>Data Points (min: 100, max : 500) &emsp;{deviceIMEI != "" && <span>Device IMEI : {deviceIMEI}</span>} </h5>
                <input type="number" name="item_title" id="item_title" className="form-control" value={amountRuns} onChange={(e) => { setAmountRuns(e.target.value) }} />

                <div className="spacer-10"></div>

                {/* <h5>Start Date &ensp;(your start must be after {start === 0 ? <span>{displayStart(Math.round(Date.now() / 1000) - 12 * 30 * 24 * 3600)}</span> : <span>{displayStart(Number(start))}</span>})</h5> */}
                <input type="datetime-local" name="start_date" id="start_date" className="form-control" value={dateTime} onChange={(e) => { setDateTime(e.target.value) }} />

                <div className="spacer-10"></div>

                {pendingMint && <h5>Score: {score} and rating : {rating}</h5>}

                {deviceIMEI !== "" || account ? <input type="button" id="submit" className="btn-main" value="Get Mint Data" onClick={() => startMint()} /> : <h5>Address has no registered device</h5>} {pendingMint && <span style={{ marginLeft: "3em" }}><input type="button" id="submit" className="btn-main" value="Mint Now" onClick={() => finishMint()} /></span>}

                {daoShow && <span style={{ marginLeft: "3em" }}><input type="button" id="submit" className="btn-main" value="Join/Update Dao" onClick={() => joinUpdateDao()} /> &ensp; Rating: {daoRating} &ensp; Level: {daoLevel}</span>}
              </div>
            </form>
          </div>
          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="nft__item m-0">

              <div className="author_list_pp">
                <span>
                  <img className="lazy" src={`./img/author/${(account in imageMap) ? imageMap[account] : "author-5"}.jpg`} alt="" />
                  <i className="fa fa-check"></i>
                </span>
              </div>
              <div className="nft__item_wrap">
                <span>
                  <img src={`${(files.length > 0) ? fileURL : "./img/collections/coll-item-3.jpg"}`} id="get_file_2" className="lazy nft__item_preview" alt="" />
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {penaltyLevels.length > 0 && <section className='container' style={{ paddingTop: 0 }}>
        <div className="row">
          <div className="col-lg-5 mb-5" >
            <Table striped bordered hover size="md" >
              <thead style={{ backgroundColor: "white", border: "2px solid black" }}>
                <tr>
                  <th>Levels</th>
                  <th>Penalty Score</th>
                  <th>Acc Levels</th>

                </tr>
              </thead>
              <tbody>
                {penaltyLevels.map((val, index) => {
                  let currentVal = 0;
                  if (index > 0) {
                    for (var i = 0; i <= index; i++) {
                      currentVal += Number(penaltyLevels[i]);
                    }
                  }
                  return (<tr style={{ backgroundColor: "white", border: "2px solid black" }}>
                    <td>{index + 1}</td>
                    {index === 0 ? <td>{val}</td> : <td>{val}</td>}
                    <td>{accLevels[index]}</td>
                  </tr>)
                })}
              </tbody>

            </Table>
          </div>

          <div className="col-lg-5 offset-lg-1 mb-5" >
            <Table striped bordered hover size="md" >
              <thead style={{ backgroundColor: "white", border: "2px solid black" }}>
                <tr>
                  <th>Rating</th>
                  <th>DAO Costs</th>
                  <th>AVG Scores</th>
                </tr>
              </thead>
              <tbody>
                {costLevels.map((val, index) => {
                  let scoreText = "";
                  if (index == 0) {
                    scoreText = `< ${ratingBreaks[1]}`;
                  }
                  else if (index == costLevels.length - 1) {
                    scoreText = `> ${ratingBreaks[index]}`;
                  }
                  else {
                    scoreText = `${ratingBreaks[index]}-${ratingBreaks[index + 1]}`;
                  }
                  return (<tr style={{ backgroundColor: "white", border: "2px solid black" }}>
                    {/*<td>{ratingMap[index+1]}</td>*/}
                    <td>{ratingLabels[ratingLabels.length - index - 1]}</td>
                    <td>{costLevels[index]/100000} USDC</td>
                    <td>{scoreText}</td>
                    {/*<td>{scoreMap[index+1]}</td>*/}
                  </tr>)
                })}
              </tbody>

            </Table>
          </div>
        </div>
      </section>}

      <Footer />
    </div>
  );

}
export default Mint;
