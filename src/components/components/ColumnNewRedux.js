import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { clearNfts } from '../../store/actions';
import NftCard from './NftCard';
import NewNftCard from './NewNftCard';
import { shuffleArray } from '../../store/utils';
import { propTypes } from 'react-bootstrap/esm/Image';

//react functional component
const ColumnNewRedux = ({nftList, metaDataList}) => {
    const shuffle = false;
    const dispatch = useDispatch();
    const nftsState = useSelector(selectors.nftBreakdownState);
    const nfts = nftsState.data ? shuffle ? shuffleArray(nftsState.data) : nftsState.data : [];

    const [height, setHeight] = useState(0);
    const [nftsList, setNftsList] = useState([])

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(() => {
        dispatch(actions.fetchNftsBreakdown());
    }, [dispatch]);

    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearNfts());
        }
    },[dispatch])

    useEffect(() => {
        return () => {
          console.log("cleaned up");
        };
      }, [metaDataList]);
    

    const loadMore = () => {
        dispatch(actions.fetchNftsBreakdown());
    }

    return (
        <div key = {nftList.length} className='row'>
            {/*nfts && nfts.map( (nft, index) => (
                <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} />
            ))*/}
            {
              nftList.length>0 && nftList.map( (nft, index) => (
                <NewNftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} metaData = {metaDataList[index]} />
            ))
            }
        </div>              
    );
};

export default ColumnNewRedux;