import React, {useState, useContext, useEffect} from "react";
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/Footer';
import { createGlobalStyle } from 'styled-components';
import { useWeb3React } from "@web3-react/core";
import { AccountContext } from '../App';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;

const Collection= function(props) {
const [openMenu, setOpenMenu] = React.useState(true);
const [nftList, setNftList] = useState([]);
const [metaDataList, setMetaDataList] = useState([]);

const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();

const {globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId} = useContext(AccountContext);

useEffect(() => {
  const loadUserNFTData = async () => {
  if(active){
    const response = await fetch(`/user-nfts/${account}`);
    const body = await response.json();
    const nftList = body.results;
    let metaDataList = Array(nftList.length);
    if(nftList && nftList.length > 0){
      for (let i = 0; i<nftList.length; i++){
        const tempMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${nftList[i].slice(7)}`);
        const metaDataBody = await tempMetaData.json();
        metaDataList[i] = {'name' : metaDataBody.name, 'description' : metaDataBody.description, 'image' : metaDataBody.image, 'attributes' : metaDataBody.attributes}
      }
      setMetaDataList(metaDataList);
      setNftList(nftList);
    }
    else{
      setMetaDataList([]);
      setNftList([]);
    }
  }
  else{
    setNftList([]);
    setMetaDataList([]);
  }
  setGlobalAccount(account);
  setGlobalActive(active);
  setGlobalChainId(chainId);
  }

  loadUserNFTData()
  .catch(console.error);

}, [account, active, chainId])

const imageMap = {"0xA072f8Bd3847E21C8EdaAf38D7425631a2A63631" : "author-1", "0x3fd431F425101cCBeB8618A969Ed8AA7DFD115Ca": "author-2", 
"0x42F9EC8f86B5829123fCB789B1242FacA6E4ef91" : "author-3", "0xa0Bb0815A778542454A26C325a5Ba2301C063b8c" : "author-4"}

return (
<div>
<GlobalStyles/>

  <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'./img/background/4.jpg'})`}}>
    <div className='mainbreadcumb'>
    </div>
  </section>

  <section className='container d_coll no-top no-bottom'>
    <div className='row'>
      <div className="col-md-12">
         <div className="d_profile">
                  <div className="profile_avatar">
                      <div className="d_profile_img">
                          <img src={`./img/author/${(account in imageMap) ? imageMap[account] : "author-5"}.jpg`} alt=""/>
                          <i className="fa fa-check"></i>
                      </div>
                      
                      <div className="profile_name">
                          <h4>
                          {globalActive && `${globalAccount.slice(0,5)}...${globalAccount.slice(-4)}`}                                              
                              <div className="clearfix"></div>
                              
                          </h4>
                      </div>
                  </div>

          </div>
      </div>
    </div>
  </section>

  <section className='container no-top'>
      {active && (  
        <div key = {account} id='zero1' className='onStep fadeIn'>
         <ColumnNewRedux key = {account} nftList={nftList} metaDataList = {metaDataList} />
        </div>
      )}  
  </section>

  <Footer />
</div>
);
}
export default Collection;