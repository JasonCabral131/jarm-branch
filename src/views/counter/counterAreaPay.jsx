import { CButton } from "@coreui/react";
import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { RiSecurePaymentFill, RiQrCodeLine } from "react-icons/ri";
import boopSfx from "src/assets/ringtunes/windows-error-ringtone.mp3";
import successSnd from "src/assets/ringtunes/messenger.mp3";
import { useSelector } from "react-redux";
import ToPrintContainer from "./to-print-info";
import useDetectPrint from "use-detect-print";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { cashierCounter, cashierPay, logout } from "src/redux/action";
import { Modal } from "react-bootstrap";
import { GrClose } from "react-icons/gr";
import {
  getCounterProductByCashier,
  getProductByBrandOwner,
} from "src/redux/action/product.action";
import { LoaderSpinner } from "src/reusable";
import CustomerInfo from "src/reusable/CustomerInfo";
import haveMoney from "src/assets/icons/wallet.png";
import noMoney from "src/assets/icons/no-money.png";
export const CounterAreaPay = ({
  purchase,
  setPurchase,
  payment,
  setPayment,
  tax,
  payer,
  setPayer,
  searchRef,
}) => {
  const dispatch = useDispatch();
  const componentRef = useRef();
  const { user, token } = useSelector((state) => state.auth);
  const { socket } = useSelector((state) => state.socket);
  const [salesId, setSalesId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const isPrinting = useDetectPrint();
  const subTotal = purchase.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue.total;
  }, 0);
  const getTotal = () => {
    let taxSubTotal = 0;
    tax.map((data) => {
      taxSubTotal += parseFloat(data.percentage / 100) * subTotal;
      return data;
    });
    const Total = subTotal + taxSubTotal;
    return Math.round((Total + Number.EPSILON) * 100) / 100;
  };
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      setPurchase([]);
      setPayer(null);
    },
    onBeforePrint: async (data) => {
      if (await data) {
      }
    },
  });
  useEffect(() => {
    if (purchase.length === 0) {
      setPayment({ payment: "", isvalid: false });
    }
    return () => {
      if (purchase.length === 0) {
        setPayment({ payment: "", isvalid: false });
      }
    };
    // eslint-disable-next-line
  }, [purchase]);

  useEffect(() => {
    if (isPrinting) {
      alert("is printing");
    }
    // eslint-disable-next-line
  }, [isPrinting]);

  useEffect(() => {
    if (socket) {
      socket.on("receiving-to-customer-payment-device", ({ customer }) => {
        console.log(showModal);

        let audio = new Audio(successSnd);
        audio.play();
        setPayer(customer);
        console.log(customer);
      });
    }
    // eslint-disable-next-line
  }, [socket]);
  const handlePayment = async (val, customer) => {
    if (val) {
      const salesId = Math.floor(Math.random() * 999999999999999);
      setSalesId(salesId);
      let transactionObject = {
        salesId,
        payment: payment.payment,
        customer: null,
        products: purchase,
        total: getTotal(),
        taxs: await tax.map((data) => {
          return {
            _id: data._id,
            percentage: data.percentage,
            tax: data.tax,
            amount: parseFloat(data.percentage / 100) * subTotal,
          };
        }),
      };
      handlePaymentCheck(transactionObject, customer);
      return;
    } else {
      if (customer) {
        const salesId = Math.floor(Math.random() * 999999999999999);
        setSalesId(salesId);
        let transactionObject = {
          salesId,
          payment:
            customer.payment_check === "counter-payment"
              ? payment.payment
              : getTotal(),
          customer: customer,
          products: purchase,
          total: getTotal(),
          taxs: await tax.map((data) => {
            return {
              _id: data._id,
              percentage: data.percentage,
              tax: data.tax,
              amount: parseFloat(data.percentage / 100) * subTotal,
            };
          }),
        };
        handlePaymentCheck(transactionObject, customer);
        return;
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "No Customer Info Found!",
        });
      }
    }
  };
  const handlePaymentCheck = async (transactionObject, customer) => {
    if (purchase.length < 1) {
      let audio = new Audio(boopSfx);
      audio.play();
      return;
    }
    if (!customer) {
      if (payment.payment === "") {
        let audio = new Audio(boopSfx);
        audio.play();
        return;
      }
      if (payment.payment < getTotal()) {
        let audio = new Audio(boopSfx);
        audio.play();
        return;
      }
    }
    if (customer) {
      if (customer.payment_check === "counter-payment") {
        if (payment.payment === "") {
          let audio = new Audio(boopSfx);
          audio.play();
          return;
        }
        if (payment.payment < getTotal()) {
          let audio = new Audio(boopSfx);
          audio.play();
          return;
        }
      }
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You Wont Revert this Action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed to payment",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (user.status === "owner") {
          setPaymentLoading(true);
          const res = await dispatch(cashierPay(transactionObject));
          setPaymentLoading(false);
          if (res.result) {
            Swal.fire({
              icon: "success",
              text: res.message,
            });
            handlePrint();
            dispatch(getProductByBrandOwner());

            setTimeout(() => {
              searchRef
                ? searchRef.current
                  ? searchRef.current.blur()
                  : console.log("")
                : console.log("");
            }, 400);

            return;
          }
          Swal.fire({
            icon: "warning",
            text: res.message,
          });

          return;
        } else if (user.status === "cashier") {
          setPaymentLoading(true);
          const res = await dispatch(
            cashierCounter({
              ...transactionObject,
              branch_id: user.branch._id,
            })
          );
          setPaymentLoading(false);
          if (res) {
            handlePrint();
            dispatch(
              getCounterProductByCashier({
                branch_id: user.branch._id,
                token,
              })
            );

            setTimeout(() => {
              searchRef
                ? searchRef.current
                  ? searchRef.current.blur()
                  : console.log("")
                : console.log("");
            }, 400);
            return;
          }
        } else {
          dispatch(logout());
        }
      }
    });
  };

  return (
    <div className="CounterAreaPay">
      <center>
        {" "}
        <label className="label-name text-center fs-3">Total Amount</label>
      </center>
      <h1 className="total-amount-container ">
        ₱{" "}
        {purchase.length > 0 ? (
          <span>{`${new Intl.NumberFormat().format(getTotal())}`}</span>
        ) : (
          <span>00.00</span>
        )}
      </h1>
      <label className="label-name text-left">Enter Amount</label>
      <input
        type="number"
        name="amount"
        className="inputvalue filter-input"
        min="1"
        disabled={purchase.length > 0 ? false : true}
        style={{ cursor: purchase.length > 0 ? "text" : "not-allowed" }}
        placeholder="enter amount"
        value={payment.payment}
        onChange={(e) => {
          const { value } = e.target;
          if (value < getTotal()) {
            setPayment({ payment: value, isvalid: false });
          } else {
            setPayment({ payment: value, isvalid: true });
          }
        }}
        onKeyPress={(e) => {
          if (e.key === "-" || e.key === "E" || e.key === "e") {
            e.preventDefault();
          }
          if (payment.payment < 1) {
            if (e.key === "0") {
              e.preventDefault();
            }
          }
        }}
        onPaste={(e) => {
          const data = e.clipboardData.getData("Text");
          if (!isNaN(data)) {
            if (data < 0) {
              e.preventDefault();
            }
          } else {
            e.preventDefault();
          }
          if (payment.payment < 1) {
            if (data === "0") {
              e.preventDefault();
            }
          }
        }}
      />
      {purchase.length < 1 ? (
        <small className="text-danger toshow-data">No Data Available</small>
      ) : null}
      {purchase.length > 0 ? (
        payment.payment !== "" ? (
          payment.payment < getTotal() ? (
            <h1 className="total-amount-container border border-danger">
              <span>Insufficient Amount</span>
            </h1>
          ) : (
            <>
              {" "}
              <label className="d-block label-name text-center fs-3 mt-2">
                Change
              </label>
              <h1 className="total-amount-container border border-success">
                ₱{" "}
                <span>
                  {Math.round(
                    (parseFloat(payment.payment) -
                      getTotal() +
                      Number.EPSILON) *
                      100
                  ) / 100}
                </span>
              </h1>{" "}
            </>
          )
        ) : (
          <h1 className="total-amount-container border border-danger">
            <span>Payment Needed !!!</span>
          </h1>
        )
      ) : (
        <h1 className="total-amount-container border border-danger">
          <span>No Data Found !!!</span>
        </h1>
      )}
      <CButton
        color="info"
        size="sm"
        className="mt-4 w-100 fs-3"
        onClick={() => handlePayment(true)}
        disabled={paymentLoading}
      >
        {paymentLoading ? (
          <div className="w-100">Loading...</div>
        ) : (
          <>
            {" "}
            <RiSecurePaymentFill size={25} /> Pay At Counter
          </>
        )}
      </CButton>
      <CButton
        color="primary"
        size="lg"
        className="mt-4 w-100 fs-3"
        onClick={() => {
          if (purchase.length < 1) {
            let audio = new Audio(boopSfx);
            audio.play();
            return;
          }
          setShowModal(true);
          setPayer(null);
        }}
        disabled={paymentLoading}
      >
        {paymentLoading ? (
          <>Loading...</>
        ) : (
          <>
            {" "}
            <RiQrCodeLine size={25} /> QRCODE PAYMENT
          </>
        )}
      </CButton>
      <div className="d-none">
        <ToPrintContainer
          ref={componentRef}
          user={user}
          salesId={salesId}
          purchase={purchase}
          tax={tax}
          getTotal={getTotal}
          payment={payment}
          payer={payer}
        />
      </div>
      <Modal
        show={showModal}
        size={payer ? "lg" : "md"}
        onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body>
          {paymentLoading ? (
            <LoaderSpinner height="400px" />
          ) : (
            <div
              style={{
                margin: "0 !important",
                padding: "0 !important",
                position: "relative",
                width: "100%",
              }}
            >
              {payer ? (
                <>
                  <CustomerInfo
                    payer={payer}
                    handlePayment={handlePayment}
                    setPayer={setPayer}
                    setHideModal={setShowModal}
                    total={getTotal()}
                    paymentLoading={paymentLoading}
                  />
                  <hr />
                  <div className="mt-2 row">
                    <div className="col-md-6">
                      {parseFloat(payer.deposit) >= getTotal() ? (
                        <img
                          src={haveMoney}
                          alt="have-money"
                          className="payment-img"
                        />
                      ) : (
                        <img
                          src={noMoney}
                          alt="have-nomoney"
                          className="payment-img"
                        />
                      )}
                    </div>
                    <div className="col-md-6 d-flex justify-content-center flex-column align-items-center">
                      <h1 className="label-transaction-info text-center  text-success">
                        {parseFloat(payer.deposit) >= getTotal()
                          ? "Pay Now"
                          : "Sorry You don't have sufficient amount"}
                      </h1>
                      {parseFloat(payer.deposit) >= getTotal() ? null : (
                        <>
                          <label className="label-name text-left">
                            Enter Amount
                          </label>
                          <input
                            type="number"
                            name="amount"
                            className="inputvalue filter-input"
                            min="1"
                            disabled={purchase.length > 0 ? false : true}
                            style={{
                              cursor:
                                purchase.length > 0 ? "text" : "not-allowed",
                            }}
                            placeholder="enter amount"
                            value={payment.payment}
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value < getTotal()) {
                                setPayment({ payment: value, isvalid: false });
                              } else {
                                setPayment({ payment: value, isvalid: true });
                              }
                            }}
                            onKeyPress={(e) => {
                              if (
                                e.key === "-" ||
                                e.key === "E" ||
                                e.key === "e"
                              ) {
                                e.preventDefault();
                              }
                              if (payment.payment < 1) {
                                if (e.key === "0") {
                                  e.preventDefault();
                                }
                              }
                            }}
                            onPaste={(e) => {
                              const data = e.clipboardData.getData("Text");
                              if (!isNaN(data)) {
                                if (data < 0) {
                                  e.preventDefault();
                                }
                              } else {
                                e.preventDefault();
                              }
                              if (payment.payment < 1) {
                                if (data === "0") {
                                  e.preventDefault();
                                }
                              }
                            }}
                          />
                          {purchase.length < 1 ? (
                            <small className="text-danger toshow-data">
                              No Data Available
                            </small>
                          ) : null}
                          {purchase.length > 0 ? (
                            payment.payment !== "" ? (
                              payment.payment < getTotal() ? (
                                <h1 className="total-amount-container border border-danger">
                                  <span>Insufficient Amount</span>
                                </h1>
                              ) : (
                                <>
                                  {" "}
                                  <label className="d-block label-name text-center fs-3 mt-2">
                                    Change
                                  </label>
                                  <h1 className="total-amount-container border border-success">
                                    ₱{" "}
                                    <span>
                                      {Math.round(
                                        (parseFloat(payment.payment) -
                                          getTotal() +
                                          Number.EPSILON) *
                                          100
                                      ) / 100}
                                    </span>
                                  </h1>{" "}
                                </>
                              )
                            ) : (
                              <h1 className="total-amount-container border border-danger">
                                <span>Payment Needed !!!</span>
                              </h1>
                            )
                          ) : (
                            <h1 className="total-amount-container border border-danger">
                              <span>No Data Found !!!</span>
                            </h1>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <LoaderSpinner height="400px" />
              )}
              {!payer ? (
                <div
                  className="close-transaction"
                  onClick={() => {
                    setShowModal(false);
                    setPayer(null);
                  }}
                >
                  <GrClose size={30} />
                </div>
              ) : null}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};
