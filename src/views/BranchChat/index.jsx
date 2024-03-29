import React, { useState, useEffect } from "react";
import "./style.scss";
import "./mobile.scss";
import FullWidthLogo from "src/assets/icons/hamburger_logo_expand.png";
import option1 from "src/assets/icons/cashier.jpg";
//import option2 from "src/assets/icons/branch.jpg";
import option3 from "src/assets/icons/customer.png";
import option4 from "src/assets/icons/admin.jpg";
import {
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation,
} from "react-router-dom";
import Admin from "./OptionInfo/Admin";
import Cashier from "./OptionInfo/Cashier";
import Branch from "./OptionInfo/Branch";
import Customer from "./OptionInfo/Customer";
import CashierInboxView from "./component/CashierInbox/CashierInboxView";
import BranchInboxView from "./component/BranchInbox/BranchInboxView";
import BranchView from "./component/BranchInbox/index";
import CashierView from "./component/CashierInbox";
import AdminView from "./component/AdminInbox";
import AdminInboxView from "./component/AdminInbox/AdminIbox";
import CustomerView from "./component/CustomerInbox";
import CustomerInboxView from "./component/CustomerInbox/CustomerInboxView";
import { useSelector } from "react-redux";
import boopSfx from "src/assets/ringtunes/messenger.mp3";
import axiosInstance from "src/helpers/axios";
const BranchChat = (props) => {
  const history = useHistory();
  const location = useLocation();
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.auth);
  const [cashiers, setCashiers] = useState([]);
  const [customerActive, setCustomerActive] = useState([]);
  const [unseenAdmin, setUnseenAdmin] = useState(0);
  const [unseenCustomer, setUnseenCustomer] = useState(0);
  const [unseenCashier, setUnseenCashier] = useState(0);
  const [option, setOption] = useState({
    option1: true,
    option2: false,
    option3: false,
    option4: false,
  });
  useEffect(() => {
    getUnseenChat();
    getUnseenChatCashier();
    getUnseenChatCustomer();
    if (socket) {
      socket.emit("get-active-user-by-branch", { user }, (data) => {
        setCashiers(data.customer);
      });
      socket.emit("get-active-branch-customer", { user }, (data) => {
        setCustomerActive(data);
        console.log(data);
      });
      socket.on("login-active-cashier", async ({ customer }) => {
        let ixExist = false;
        for (let cashr of cashiers) {
          if (cashr._id.toString() === customer._id.toString()) {
            ixExist = true;
          }
        }
        if (!ixExist) {
          setCashiers([...cashiers, customer]);
        }
      });
    }
    if (location) {
      if (location.pathname) {
        if (
          location.pathname.toLocaleLowerCase() === "/jarm-chat-system/admin"
        ) {
          setOption({
            option1: false,
            option2: false,
            option3: false,
            option4: true,
          });
        }
        if (location.pathname.includes("/jarm-chat-system/customer")) {
          setOption({
            option1: false,
            option2: false,
            option3: true,
            option4: false,
          });
        }
      }
    }

    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (socket) {
      socket.emit("get-active-user-by-branch", { user }, (data) => {
        setCashiers(data.customer);
      });
      socket.on("login-active-cashier", async ({ customer }) => {
        let ixExist = false;
        for (let cashr of cashiers) {
          if (cashr._id.toString() === customer._id.toString()) {
            ixExist = true;
          }
        }
        if (!ixExist) {
          setCashiers([...cashiers, customer]);
        }
      });
      socket.emit("get-active-branch-customer", { user }, (data) => {
        setCustomerActive(data);
        console.log(data);
      });
      socket.on("disconnect-cashier", async ({ cashierId }) => {
        const filterOut = cashiers.filter(
          (data) => data._id.toString() !== cashierId.toString()
        );
        setCashiers(filterOut);
      });
      socket.on("new-message-send-by-cashier", async (data) => {
        let audio = new Audio(boopSfx);
        audio.play();
        getUnseenChatCashier();
      });
      socket.on("disconnected-customer-from-server", (data) => {
        socket.emit("get-active-branch-customer", { user }, (data) => {
          setCustomerActive(data);
          console.log(data);
        });
      });
      socket.on("new-join-customer", (data) => {
        socket.emit("get-active-branch-customer", { user }, (data) => {
          setCustomerActive(data);
          console.log(data);
        });
      });
      socket.on("new-message-send-by-customer", async (data) => {
        let audio = new Audio(boopSfx);
        audio.play();
        getUnseenChatCustomer();
      });
      socket.on("new-message-send-by-admin", async (data) => {
        let audio = new Audio(boopSfx);
        audio.play();
        getUnseenChat();
      });
      socket.on("update-seen-admin-chat", async (data) => {
        getUnseenChat();
      });
    }
    // eslint-disable-next-line
  }, [socket]);
  const getUnseenChat = async () => {
    try {
      const res = await axiosInstance.get("/get-unseen-chat-admin-details");
      if (res.status === 200) {
        setUnseenAdmin(res.data);
      }
    } catch (e) {}
  };
  const getUnseenChatCustomer = async () => {
    try {
      const res = await axiosInstance.get("/get-unseen-chat-customer-details");
      if (res.status === 200) {
        setUnseenCustomer(res.data);
      }
    } catch (e) {}
  };
  const getUnseenChatCashier = async () => {
    try {
      const res = await axiosInstance.get("/get-unseen-chat-cashier-details");
      if (res.status === 200) {
        setUnseenCashier(res.data);
      }
    } catch (e) {}
  };
  return (
    <div className="branch-chat-container">
      <div className="branch-chat-heading shadow">
        <div
          className="logo-container"
          onClick={() => {
            history.push("/branch/dashboard");
          }}
        >
          <img alt="logo-jarm" src={FullWidthLogo} />
          <h1 className="chat-system-h1"> Chat System</h1>
        </div>
      </div>
      <div className="body-chat-system">
        <div className="chat-sidebar-container">
          <div className="list-option-container shadow">
            <div
              className={`list-option-info ${
                option.option1 ? "active-option" : ""
              }`}
              onClick={() => {
                setOption({
                  option1: true,
                  option2: false,
                  option3: false,
                  option4: false,
                });
                history.push("/jarm-chat-system/cashier");
              }}
            >
              <img alt="cashier-logo" src={option1} />
              {unseenCashier > 0 ? (
                <div className="status-check">
                  <span>{unseenCashier}</span>
                </div>
              ) : null}
            </div>
            <div
              className={`list-option-info ${
                option.option3 ? "active-option" : ""
              }`}
              onClick={() => {
                setOption({
                  option1: false,
                  option2: false,
                  option3: true,
                  option4: false,
                });
                history.push("/jarm-chat-system/customer");
              }}
            >
              <img alt="cashier-logo" src={option3} />
              {unseenCustomer > 0 ? (
                <div className="status-check">
                  <span>{unseenCustomer}</span>
                </div>
              ) : null}
            </div>
            <div
              className={`list-option-info ${
                option.option4 ? "active-option" : ""
              }`}
              onClick={() => {
                setOption({
                  option1: false,
                  option2: false,
                  option3: false,
                  option4: true,
                });
                history.push("/jarm-chat-system/admin");
                getUnseenChat();
              }}
            >
              <img alt="cashier-logo" src={option4} />
              {unseenAdmin > 0 ? (
                <div className="status-check">
                  <span>{unseenAdmin}</span>
                </div>
              ) : null}
            </div>
          </div>

          {option.option1 ? (
            <Cashier cashiersActive={cashiers} setCashiers={setCashiers} />
          ) : null}
          {option.option2 ? <Branch /> : null}
          {option.option3 ? (
            <Customer
              customerActive={customerActive}
              setCustomerActive={setCustomerActive}
            />
          ) : null}
          {option.option4 ? <Admin /> : null}
        </div>
        <div className="chat-body-container">
          <Switch>
            <Route
              exact
              component={CashierView}
              path={"/jarm-chat-system/cashier"}
            />
            <Route
              exact
              component={CashierInboxView}
              path={"/jarm-chat-system/cashier/:cashierId"}
            />
            <Route
              exact
              component={BranchView}
              path={"/jarm-chat-system/branch"}
            />
            <Route
              exact
              component={BranchInboxView}
              path={"/jarm-chat-system/branch/:branchId"}
            />
            <Route
              exact
              component={CustomerView}
              path={"/jarm-chat-system/customer"}
            />
            <Route
              exact
              component={CustomerInboxView}
              render={(props) => {
                return <CustomerInboxView {...props} setOption={setOption} />;
              }}
              path={"/jarm-chat-system/customer/:customerId"}
            />
            <Route
              exact
              component={AdminView}
              path={"/jarm-chat-system/admin"}
            />
            <Route
              exact
              component={AdminInboxView}
              path={"/jarm-chat-system/admin/:adminId"}
            />
            <Redirect to={"/jarm-chat-system/cashier"} />
          </Switch>
        </div>
      </div>
    </div>
  );
};
export default BranchChat;
