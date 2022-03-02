import React, { useState, useContext, useEffect } from 'react';
import ColumnNewThreeColRedux from '../components/ColumnNewThreeColRedux';
import Footer from '../components/Footer';
import { createGlobalStyle } from 'styled-components';
import { useWeb3React } from "@web3-react/core";
import { AccountContext } from '../../state/contexts/AccountContext';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;

const Holdings = function (props) {
  const [nftList, setNftList] = useState([]);
  const [metaDataList, setMetaDataList] = useState([]);
  const [memberList, setMemberList] = useState([]);

  const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();

  const { globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId } = useContext(AccountContext);


  useEffect(() => {
    const loadUserNFTData = async () => {
      if (active) {
        const response = await fetch(`/dao-nfts/${account}`);
        const body = await response.json();
        const nftList = body.results;
        let metaDataList = Array(nftList.length);
        const members = body.members;

        if (nftList && nftList.length > 0) {
          for (let i = 0; i < nftList.length; i++) {
            const tempMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${nftList[i].slice(7)}`);
            const metaDataBody = await tempMetaData.json();
            metaDataList[i] = { 'name': metaDataBody.name, 'description': metaDataBody.description, 'image': metaDataBody.image, 'attributes': metaDataBody.attributes }
          }
          setMetaDataList(metaDataList);
          setNftList(nftList);
          setMemberList(members);
        }
        else {
          setMetaDataList([]);
          setNftList([]);
          setMemberList([]);
        }
      }
      else {
        setNftList([]);
        setMetaDataList([]);
        setMemberList([]);
      }
      setGlobalAccount(account);
      setGlobalActive(active);
      setGlobalChainId(chainId);
    }

    loadUserNFTData()
      .catch(console.error);

  }, [account, active, chainId])

  const imageMap = {
    "0xA072f8Bd3847E21C8EdaAf38D7425631a2A63631": "author-1", "0x3fd431F425101cCBeB8618A969Ed8AA7DFD115Ca": "author-2",
    "0x42F9EC8f86B5829123fCB789B1242FacA6E4ef91": "author-3", "0xa0Bb0815A778542454A26C325a5Ba2301C063b8c": "author-4"
  }

  return (
    <div>
      <GlobalStyles />
      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'./img/background/4.jpg'})` }}>
        <div className='mainbreadcumb'>
        </div>
      </section>

      <section className='container no-top'>
        {active && (
          <div key={account} id='zero1' className='onStep fadeIn'>
            <ColumnNewThreeColRedux key={account} nftList={nftList} metaDataList={metaDataList} memberList={memberList} />
          </div>
        )}
      </section>


      <Footer />
    </div>

  );
}
export default Holdings;