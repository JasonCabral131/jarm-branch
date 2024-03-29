import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from "@coreui/react";

import TheLogo from "./../assets/icons/Jarm_Logo.svg";
import TheLogoFullWidth from "./../assets/icons/hamburger_logo_expand.png";
// sidebar nav config
import navigation from "./nav";

const TheSidebar = () => {
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.coreUiState.sidebarShow);

  return (
    <CSidebar
      show={sidebarShow}
      onShowChange={(val) => dispatch({ type: "set", sidebarShow: val })}
    >
      <CSidebarBrand className="d-md-down-none" to="/">
        <img
          src={TheLogoFullWidth}
          className="c-sidebar-brand-full"
          alt="logo-negative"
          height={35}
        />
        <img
          src={TheLogo}
          className="c-sidebar-brand-minimized"
          alt="logo-negative"
          height={35}
        />
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement
          items={navigation}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle,
          }}
        />
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none" />
    </CSidebar>
  );
};

export default React.memo(TheSidebar);
