import React, { useState, useContext, useEffect } from "react";
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/Footer';
import { createGlobalStyle } from 'styled-components';
import { useArgentX } from "../../state/hooks/useArgentX";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;

const Collection = function (props) {
  const [openMenu, setOpenMenu] = React.useState(true);
  const [nftList, setNftList] = useState([]);
  const [metaDataList, setMetaDataList] = useState([]);

  const argentX = useArgentX();
  console.log(argentX.globalAccount, 'account in collection')
  useEffect(() => {
    const loadUserNFTData = async () => {
      if (argentX.globalAccount) {
        const response = await fetch(`/user-nfts/${argentX.globalAccount}`);
        const body = await response.json();
        const nftList = body.results;
        let metaDataList = Array(nftList.length);
        if (nftList && nftList.length > 0) {
          for (let i = 0; i < nftList.length; i++) {
            const tempMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${nftList[i].slice(7)}`);
            const metaDataBody = await tempMetaData.json();
            metaDataList[i] = { 'name': metaDataBody.name, 'description': metaDataBody.description, 'image': metaDataBody.image, 'attributes': metaDataBody.attributes }
          }
          setMetaDataList(metaDataList);
          setNftList(nftList);
        }
        else {
          setMetaDataList([]);
          setNftList([]);
        }
      }
      else {
        setNftList([]);
        setMetaDataList([]);
      }
    }

    loadUserNFTData()
      .catch(console.error);

  }, [argentX.globalAccount])

  // Need to update these accounts
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

      <section className='container d_coll no-top no-bottom'>
        <div className='row'>
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                <div className="d_profile_img">
                  <img src={`./img/author/${(argentX.globalAccount in imageMap) ? imageMap[argentX.globalAccount] : "author-5"}.jpg`} alt="" />
                  <i className="fa fa-check"></i>
                </div>

                <div className="profile_name">
                  <h4>
                    {argentX.globalAccount && `${argentX.globalAccount.slice(0, 5)}...${argentX.globalAccount.slice(-4)}`}
                    <div className="clearfix"></div>

                  </h4>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className='container no-top'>
        {argentX.globalAccount && (
          <div key={argentX.globalAccount} id='zero1' className='onStep fadeIn'>
            <ColumnNewRedux key={argentX.globalAccount} nftList={nftList} metaDataList={metaDataList} />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
export default Collection;