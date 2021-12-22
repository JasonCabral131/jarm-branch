import React, { useState, useRef, useEffect } from "react";
import { CDataTable, CCollapse, CCardBody } from "@coreui/react";
import { AiOutlineDown, AiOutlineUp, AiOutlinePrinter } from "react-icons/ai";
import { WeeklyFields } from "../salesWidget";
import Sale2Png from "src/assets/icons/sell.gif";
import { useReactToPrint } from "react-to-print";
import AllWeeklyPrinting from "../Printing/WeeklyPrinting/WeeklyPrinting";
import { useSelector } from "react-redux";
import SelectedWeek from "../Printing/WeeklyPrinting/SelectedWeek";
import SelectDay from "../Printing/Daily/SelectDay";
import TransactDaily from "../Printing/Daily/TransactionDaily";

const WeeklySaleInfo = ({ sales, loading, cinfo }) => {
  const [details, setDetails] = useState([]);
  const [dailydetails, setDailyDetails] = useState([]);
  const [transactDetials, setTransactDetails] = useState([]);
  const [sWeek, setSWeek] = useState(null);
  const [sWTrigger, setSWTrigger] = useState("");
  const [SDate, setSelectDate] = useState(null);
  const [strigger, setStrigger] = useState("");
  const [tTriger, setTrigger] = useState("");
  const [tData, setTData] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const allDataRef = useRef();
  const wSelectDataRef = useRef();
  const selectedRef = useRef();
  const tRef = useRef();
  const toggleDetails = (index) => {
    const position = details.indexOf(index);
    let newDetails = details.slice();
    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...details, index];
    }
    setDetails(newDetails);
  };
  const toggleDailyDetails = (index) => {
    const position = dailydetails.indexOf(index);
    let newDetails = dailydetails.slice();
    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...dailydetails, index];
    }
    setDailyDetails(newDetails);
  };
  const toggleTransactionDetails = (index) => {
    const position = transactDetials.indexOf(index);
    let newDetails = transactDetials.slice();
    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...transactDetials, index];
    }
    setTransactDetails(newDetails);
  };
  const handlePrintAllDailySaleData = useReactToPrint({
    content: () => allDataRef.current,
  });
  const handlePrintingSelectWeek = useReactToPrint({
    content: () => wSelectDataRef.current,
  });
  const handlePrintSelectedDate = useReactToPrint({
    content: () => selectedRef.current,
  });
  const handlePrintTransaction = useReactToPrint({
    content: () => tRef.current,
  });

  useEffect(() => {
    if (sWeek) {
      handlePrintingSelectWeek();
    }
    // eslint-disable-next-line
  }, [sWeek, sWTrigger]);

  useEffect(() => {
    if (SDate) {
      handlePrintSelectedDate();
    }
    // eslint-disable-next-line
  }, [SDate, strigger]);
  useEffect(() => {
    if (tData) {
      handlePrintTransaction();
    }
    // eslint-disable-next-line
  }, [tData, tTriger]);
  return (
    <>
      <h1 className="header-card-information mt-5">
        <img
          alt="sales"
          src={Sale2Png}
          style={{ height: "80px", width: "250px" }}
        />
        <span>Weekly Sale Information</span>
      </h1>
      <div className="card  mt-4 p-3" style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            position: "absolute",
            right: 10,
            top: 20,
          }}
        >
          <AiOutlinePrinter
            size="25"
            className="hover"
            onClick={() => {
              handlePrintAllDailySaleData();
            }}
          />
        </div>

        <div className="card-body mt-2">
          <CDataTable
            items={sales ? (sales.salesByWeek ? sales.salesByWeek : []) : []}
            fields={WeeklyFields}
            columnFilter={false}
            tableFilterValue={null}
            tableFilter={{ placeholder: "search information..." }}
            itemsPerPageSelect={true}
            itemsPerPage={5}
            hover
            sorter
            pagination
            loading={loading}
            scopedSlots={{
              show_details: (item, index) => (
                <td>
                  <div className="d-flex justify-content-center">
                    <AiOutlinePrinter
                      size="20"
                      className="hover"
                      onClick={() => {
                        setSWeek(item);
                        setSWTrigger(Math.random());
                      }}
                    />
                    {details.includes(index) ? (
                      <AiOutlineDown
                        onClick={() => {
                          toggleDetails(index);
                        }}
                        className="hover mt-1 ml-4"
                      />
                    ) : (
                      <AiOutlineUp
                        onClick={() => {
                          toggleDetails(index);
                        }}
                        className="hover mt-1 ml-4"
                      />
                    )}
                  </div>
                </td>
              ),
              details: (item, index) => {
                return (
                  <CCollapse show={details.includes(index)}>
                    <CCardBody className={"p-2"}>
                      <h4 className="ml-2">{item.date + " List Of Sales"}</h4>
                      <div className=" card shadow p-2">
                        <CDataTable
                          items={[...item.data]}
                          fields={dailyField}
                          columnFilter={false}
                          tableFilter={{ placeholder: "date (ex: 12/10/2022)" }}
                          footer={false}
                          itemsPerPageSelect={true}
                          itemsPerPage={5}
                          hover
                          sorter
                          pagination
                          scopedSlots={{
                            total: (item) => (
                              <td className="fw-bolder">
                                {`₱ ${new Intl.NumberFormat().format(
                                  Math.round(
                                    (item.total + Number.EPSILON) * 100
                                  ) / 100
                                )}`}
                              </td>
                            ),
                            show_details: (item, index) => (
                              <td>
                                <div className="d-flex justify-content-center">
                                  <AiOutlinePrinter
                                    size="20"
                                    className="hover"
                                    onClick={() => {
                                      setSelectDate(item);
                                      setStrigger(Math.random());
                                    }}
                                  />
                                  {dailydetails.includes(index) ? (
                                    <AiOutlineDown
                                      onClick={() => {
                                        toggleDailyDetails(index);
                                      }}
                                      className="hover mt-1 ml-4"
                                    />
                                  ) : (
                                    <AiOutlineUp
                                      onClick={() => {
                                        toggleDailyDetails(index);
                                      }}
                                      className="hover mt-1 ml-4"
                                    />
                                  )}
                                </div>
                              </td>
                            ),
                            details: (item, index) => {
                              return (
                                <CCollapse show={dailydetails.includes(index)}>
                                  <CCardBody className={"p-2"}>
                                    <h4 className="ml-2">
                                      {item.date + " List Of Sales"}
                                    </h4>
                                    <div className=" card shadow p-2 mt-2">
                                      <CDataTable
                                        items={[...item.data]}
                                        fields={transactField}
                                        columnFilter={false}
                                        tableFilter={{
                                          placeholder: "transaction id",
                                        }}
                                        footer={true}
                                        itemsPerPageSelect={true}
                                        itemsPerPage={5}
                                        hover
                                        sorter
                                        pagination
                                        scopedSlots={{
                                          total: (item) => (
                                            <td className="fw-bolder">
                                              {`₱ ${new Intl.NumberFormat().format(
                                                Math.round(
                                                  (item.total +
                                                    Number.EPSILON) *
                                                    100
                                                ) / 100
                                              )}`}
                                            </td>
                                          ),
                                          show_details: (item, index) => (
                                            <td>
                                              <div className="d-flex justify-content-center">
                                                <AiOutlinePrinter
                                                  size="20"
                                                  className="hover"
                                                  onClick={() => {
                                                    setTData(item);
                                                    setTrigger(Math.random());
                                                  }}
                                                />
                                                {transactDetials.includes(
                                                  index
                                                ) ? (
                                                  <AiOutlineDown
                                                    onClick={() => {
                                                      toggleTransactionDetails(
                                                        index
                                                      );
                                                    }}
                                                    className="hover mt-1 ml-4"
                                                  />
                                                ) : (
                                                  <AiOutlineUp
                                                    onClick={() => {
                                                      toggleTransactionDetails(
                                                        index
                                                      );
                                                    }}
                                                    className="hover mt-1 ml-4"
                                                  />
                                                )}
                                              </div>
                                            </td>
                                          ),
                                          details: (item, index) => {
                                            return (
                                              <CCollapse
                                                show={transactDetials.includes(
                                                  index
                                                )}
                                              >
                                                <CCardBody className={"p-2"}>
                                                  <div className=" card shadow p-2">
                                                    <h4 className="ml-2">
                                                      <span
                                                        style={{
                                                          color: "#adadad",
                                                          letterSpacing: 3,
                                                        }}
                                                      >
                                                        Product List
                                                      </span>
                                                    </h4>
                                                    <CDataTable
                                                      items={[
                                                        ...handleShowProduct(
                                                          item.product
                                                        ),
                                                      ]}
                                                      fields={productFields}
                                                      columnFilter={false}
                                                      tableFilter={{
                                                        placeholder: "product",
                                                      }}
                                                      footer={false}
                                                      itemsPerPageSelect={true}
                                                      itemsPerPage={5}
                                                      hover
                                                      sorter
                                                      pagination
                                                    />
                                                  </div>
                                                </CCardBody>
                                              </CCollapse>
                                            );
                                          },
                                        }}
                                      />
                                    </div>
                                  </CCardBody>
                                </CCollapse>
                              );
                            },
                          }}
                        />
                      </div>
                    </CCardBody>
                  </CCollapse>
                );
              },
            }}
          />
          <div style={{ display: "none" }}>
            <AllWeeklyPrinting
              ref={allDataRef}
              user={user}
              cinfo={cinfo}
              sales={sales ? sales.salesByWeek : null}
              type={"Weekly Sales Information"}
            />
            <SelectedWeek
              ref={wSelectDataRef}
              sales={sWeek}
              cinfo={cinfo}
              user={user}
            />
            <SelectDay
              ref={selectedRef}
              user={user}
              cinfo={cinfo}
              sales={SDate}
            />
            <TransactDaily ref={tRef} user={user} cinfo={cinfo} sales={tData} />
          </div>
        </div>
      </div>
    </>
  );
};
export default WeeklySaleInfo;

export const dailyField = [
  { key: "date", label: "Date", _style: { width: "45%" } },
  { key: "totalAmount", label: "Sales", _style: { width: "45%" } },

  {
    key: "show_details",
    label: "",
    _style: { width: "10%" },
    sorter: false,
    filter: false,
  },
];
export const transactField = [
  { key: "salesId", label: "Transaction ID", _style: { width: "45%" } },
  { key: "total", label: "Sales", _style: { width: "45%" } },

  {
    key: "show_details",
    label: "",
    _style: { width: "10%" },
    sorter: false,
    filter: false,
  },
];
export const productFields = [
  { key: "product", label: "Product" },
  { key: "price", label: "Price" },
  { key: "quantity", label: "Quantity" },
  { key: "amount", label: "Amount" },
];
export const handleShowProduct = (item) => {
  return item.map((data) => {
    return { ...data, product: data.product.product };
  });
};
