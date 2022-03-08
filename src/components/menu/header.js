import React, { useEffect, useState, useContext } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { header } from 'react-bootstrap';
import { Link } from '@reach/router';
import useOnclickOutside from "react-cool-onclickoutside";

import { useArgentX } from "../../state/hooks/useArgentX";

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const NavLink = props => (
  <Link
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: isCurrent ? 'active' : 'non-active',
      };
    }}
  />
);


const Header = function () {

  const [openMenu, setOpenMenu] = React.useState(false);
  const [openMenu1, setOpenMenu1] = React.useState(false);
  const [openMenu2, setOpenMenu2] = React.useState(false);
  const [openMenu3, setOpenMenu3] = React.useState(false);

  const argentX = useArgentX();

  useEffect(() => {
    if (argentX.globalAccount) {
      argentX.setConnected(true)
    }
  }, [argentX.connectToArgentX])

  const disconnect = () => {
    argentX.setConnected(false)
    argentX.setGlobalAccount('')
  }


  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
  };
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
  };
  const handleBtnClick2 = () => {
    setOpenMenu2(!openMenu2);
  };
  const handleBtnClick3 = () => {
    setOpenMenu3(!openMenu3);
  };
  const closeMenu = () => {
    setOpenMenu(false);
  };
  const closeMenu1 = () => {
    setOpenMenu1(false);
  };
  const closeMenu2 = () => {
    setOpenMenu2(false);
  };
  const closeMenu3 = () => {
    setOpenMenu3(false);
  };
  const ref = useOnclickOutside(() => {
    closeMenu();
  });
  const ref1 = useOnclickOutside(() => {
    closeMenu1();
  });
  const ref2 = useOnclickOutside(() => {
    closeMenu2();
  });
  const ref3 = useOnclickOutside(() => {
    closeMenu3();
  });

  const [showmenu, btn_icon] = useState(false);
  useEffect(() => {
    const header = document.getElementById("myHeader");
    const totop = document.getElementById("scroll-to-top");
    const sticky = header.offsetTop;
    const scrollCallBack = window.addEventListener("scroll", () => {
      btn_icon(false);
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
        totop.classList.add("show");

      } else {
        header.classList.remove("sticky");
        totop.classList.remove("show");
      } if (window.pageYOffset > sticky) {
        closeMenu();
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, []);

  return (
    <header id="myHeader" className='navbar white'>
      <div className='container'>
        <div className='row w-100-nav'>
          <div className='logo px-0'>
            <div className='navbar-title navbar-item'>
              <NavLink to="/">
                <img
                  src='./img/pebblewhite2.png'
                  className="img-fluid d-block"
                  alt="#"
                />
                <img
                  src='./img/pebblewhite2.png'
                  className="img-fluid d-3"
                  alt="#"
                />
                <img
                  src='./img/pebblewhite2.png'
                  className="img-fluid d-none"
                  alt="#"
                />
              </NavLink>
            </div>
          </div>

          <div className='search'>
            <input id="quick_search" className="xs-hide" name="quick_search" placeholder="Search for items here..." type="text" />
          </div>

          <BreakpointProvider>
            <Breakpoint l down>
              {showmenu &&
                <div className='menu'>



                  <div className='navbar-item'>
                    <NavLink to="/home" onClick={() => btn_icon(!showmenu)}>
                      Home
                    </NavLink>
                  </div>
                  <div className='navbar-item'>
                    <NavLink to="/profile" onClick={() => btn_icon(!showmenu)}>
                      Profile
                    </NavLink>
                  </div>
                  <div className='navbar-item'>
                    <NavLink to="/holdings" onClick={() => btn_icon(!showmenu)}>
                      DAO Holdings
                    </NavLink>
                  </div>
                  <div className='navbar-item'>
                    <NavLink to="/mint" onClick={() => btn_icon(!showmenu)}>
                      Mint
                    </NavLink>
                  </div>

                </div>
              }
            </Breakpoint>

            <Breakpoint xl>
              <div className='menu'>

                <div className='navbar-item'>
                  <NavLink to="/activity">
                    Home
                    <span className='lines'></span>
                  </NavLink>
                </div>

                <div className='navbar-item'>
                  <NavLink to="/profile">
                    Profile
                    <span className='lines'></span>
                  </NavLink>
                </div>
                <div className='navbar-item'>
                  <NavLink to="/holdings">
                    DAO Holdings
                    <span className='lines'></span>
                  </NavLink>
                </div>

                <div className='navbar-item'>
                  <NavLink to="/mint">
                    Mint
                    <span className='lines'></span>
                  </NavLink>
                </div>

              </div>
            </Breakpoint>
          </BreakpointProvider>
          <div className='mainside'>
            {argentX.connected && <p style={{ color: "white" }}>Account: {`${argentX.globalAccount.toString().slice(0, 6)}...${argentX.globalAccount.toString().slice(-4)}`}</p>}
            {argentX.connected ? <button onClick={() => disconnect()} className="btn-main">Disconnect</button> : <button className="btn-main" onClick={() => argentX.connectToArgentX()}>Connect</button>}
          </div>
          {/*<div className='mainside'>
            {globalActive ? <button onClick={disconnect} className="btn-main">Disconnect</button> : <button onClick={connect} className="btn-main">Connect</button>}
            </div>*/}

        </div>

        <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
          <div className="menu-line black"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>

      </div>
    </header>
  );
}
export default Header;