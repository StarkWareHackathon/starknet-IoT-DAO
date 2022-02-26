import React, { memo, useEffect, useState } from 'react';
import styled from "styled-components";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;
const imageMap = {"0xA072f8Bd3847E21C8EdaAf38D7425631a2A63631" : "author-1", "0x3fd431F425101cCBeB8618A969Ed8AA7DFD115Ca": "author-2", 
"0x42F9EC8f86B5829123fCB789B1242FacA6E4ef91" : "author-3", "0xa0Bb0815A778542454A26C325a5Ba2301C063b8c" : "author-4"}

//react functional component
const NewDaoNftCard = ({ nft, className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', height, onImgLoad, metaData, member}) => {
    const [score, setScore] = useState(0);
    useEffect(() => {
        setScore(Math.round(Math.random()*20)+10);
        return () => {
          console.log("cleaned up");
        };
      }, [metaData]);

    return (
        <div className={className}>
            <div className="nft__item m-0">
                
                <div className="author_list_pp">
                <img className="lazy" src={`./img/author/${(member in imageMap) ? imageMap[member] : "author-5"}.jpg`} alt=""/>
                        <i className="fa fa-check"></i>
                </div>
                <div className="nft__item_wrap" style={{height: `${height}px`}}>
                <Outer>
                    <span>
                        <img key = {metaData} onLoad={onImgLoad} src={metaData ? `https://gateway.pinata.cloud/ipfs/${metaData.image.slice(7)}` : ""} className="lazy nft__item_preview" alt=""/>
                    </span>
                </Outer>
                </div>
                
                <div className="nft__item_info">
                    <span>
                        <a href={nft ? `https://gateway.pinata.cloud/ipfs/${nft.slice(7)}`: ""} target= "_blank"><h4>{metaData ? `${metaData.name.slice(0,-34)}...${metaData.name.slice(-4)}` : ""}</h4></a>
                    </span>
                    <div className="nft__item_price">
                        <span>Score: {metaData ?  metaData.attributes.score : ""}</span><span>Rating: {metaData ? metaData.attributes.rating : ""}</span><span>Avg: {metaData ? metaData.attributes.average : ""}</span>
                    </div>
                    
                    <div className="nft__item_like" style={{paddingTop: "0.75em"}}>
                        <i className="fa fa-heart"></i><span>{score}</span>
                    </div>                            
                </div> 
            </div>
        </div>             
    );
};

export default NewDaoNftCard;