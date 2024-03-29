import React, { useEffect, useState } from "react";
import axiosInstance from "src/helpers/axios";
import Female from "src/assets/icons/female.jpg";
import Male from "src/assets/icons/male.jpg";
import { toCapitalized } from "src/reusable";
import UnseenCashier from "./unseen/UnseenCashier";
import Loader from "react-loader-spinner";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
const Cashier = ({ cashiersActive, setCashiers }) => {
  const [cashierList, setCashierList] = useState([]);
  const [search, setSearch] = useState("");
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const getBranchCashier = () => {
    if (cashierList.length < 1) {
      setLoading(true);
    }
    axiosInstance
      .get("/get-all-cashier-by-branch")
      .then((res) => {
        if (res.status === 200) {
          setCashierList(res.data);
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getBranchCashier();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    getBranchCashier();
    // eslint-disable-next-line
  }, [cashiersActive]);
  const activeNotActive = () => {
    let Active = [];
    let Unactive = [];
    cashierList.map((cashier) => {
      const isActive = cashiersActive
        ? cashiersActive.filter(
            (xx) => xx._id.toString() === cashier._id.toString()
          )
        : [];
      if (isActive.length > 0) {
        Active.push(cashier);
        return cashier;
      } else {
        Unactive.push(cashier);
        return cashier;
      }
    });

    return [...Active, ...Unactive];
  };
  useEffect(() => {
    if (socket) {
      socket.emit("get-active-user-by-branch", { user }, (data) => {
        setCashiers(data.customer);
      });
    }
    // eslint-disable-next-line
  }, []);
  return (
    <div className="option-container-info scale-up-bl">
      <div className="searh-bar-container">
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div>
      <label className=" ml-1 fw-bold mt-1 w-50" style={{ color: "#f47a36" }}>
        List Cashier Store
      </label>
      <div className="users-container">
        {loading ? (
          <div className="w-100 d-flex flex-column justify-content-center align-items-center">
            <Loader type="Circles" />
            <p>Loading</p>
          </div>
        ) : (
          activeNotActive().map((cashier) => {
            const isActive = cashiersActive
              ? cashiersActive.filter(
                  (xx) => xx._id.toString() === cashier._id.toString()
                )
              : [];
            const name = toCapitalized(
              `${cashier.firstname} ${cashier.lastname}`
            );
            if (name.toLowerCase().includes(search.toLowerCase())) {
              return (
                <CashierDetails
                  key={Math.random()}
                  cashier={cashier}
                  isActive={isActive}
                />
              );
            } else {
              return null;
            }
          })
        )}
      </div>
    </div>
  );
};

const CashierDetails = ({ isActive, cashier }) => {
  const history = useHistory();

  return (
    <div
      className={`online-field-container`}
      onClick={() => history.push(`/jarm-chat-system/cashier/${cashier._id}`)}
    >
      <div className="online-avatar-container">
        <img
          className="online-avatar"
          alt="avatar-logo"
          src={
            cashier.profile.url
              ? cashier.profile.url
              : cashier.profile.sex === "Male"
              ? Female
              : Male
          }
        />
      </div>
      <div className="online-profile-container">
        {toCapitalized(`${cashier.firstname} ${cashier.lastname}`)}
      </div>
      <UnseenCashier cashierId={cashier._id} />
      {isActive.length > 0 ? <span className="is-active-circle" /> : null}
    </div>
  );
};
export default Cashier;
