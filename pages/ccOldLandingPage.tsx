import React, { useEffect, useState } from "react";
import styles from "../styles/pages/Mixins.module.scss";
import { useRouter } from "next/router";
import { useAppSelector } from "../src/redux/hooks";
import {
  useGetDistrictList,
  getLinkedSroDetails,
  UseSaveCCrequestDetails,
  getValidateCC,
} from "../src/axios";
import TableText from "../src/components/TableText";
import TableDropdownSRO from "../src/components/TableDropdownSRO";
import { Col, Container, Row } from "react-bootstrap";
import TableInputText from "../src/components/TableInputText";
import {
  CallingAxios,
  KeepLoggedIn,
  ShowMessagePopup,
} from "../src/GenericFunctions";
import Head from "next/head";

const CcLandingpage = () => {
  const router = useRouter();
  const LoginDetails = useAppSelector((state) => state.login.loginDetails);
  const [DistrictList, setDistrictList] = useState([]);
  const [SROOfficeList2, setSROOfficeList2] = useState([]);
  const [showAfter2003Msg, setShowAfter2003Msg] = useState(false);
  const [LinkDocument, setLinkDocument] = useState({
    linkDocNo: "",
    regYear: "",
    district: "",
    sroOffice: "",
    sroCode: "",
    bookNo: 1,
  });

  const TO_DATE = 1999;

  const redirectToPage = (location: string) => {
    router.push({ pathname: location });
  };

  useEffect(() => {
    if (KeepLoggedIn()) {
      window.onpopstate = () => {
        router.push("/CCdashboardPage");
      };
    } else {
      ShowMessagePopup(false, "Invalid Access", "/");
    }
  }, []);

  useEffect(() => {
    if (DistrictList.length == 0) {
      GetDistrictList();
    }
  }, []);

  const GetDistrictList = async () => {
    let result = await CallingAxios(useGetDistrictList());
    if (result.status) {
      let sortedResult = result.data.sort((a, b) => (a.name < b.name ? -1 : 1));
      setDistrictList(result.data ? sortedResult : []);
    } else {
      ShowMessagePopup(false, "District Fetch Failed", "");
    }
  };

  const GetLinkedSROOfficeList = async (id: any) => {
    let result = await CallingAxios(getLinkedSroDetails(id));
    if (result.status) {
      let sortedResult = result.data.sort((a, b) => (a.name < b.name ? -1 : 1));
      setSROOfficeList2(sortedResult);
    }
  };

  const onChange = (e: any) => {
    setShowAfter2003Msg(false);
    let TempDetails: any = { ...LinkDocument };
    let addName = e.target.name;
    let addValue = e.target.value;
    if (addName == "district") {
      if (addValue == "") {
        return;
      }
      setSROOfficeList2([]);
      let selected = DistrictList.find((e) => e.name == addValue);
      if (selected) GetLinkedSROOfficeList(selected.id);
    } else if (addName == "linkDocNo") {
    } else if (addName == "sroOffice") {
      if (addValue == "") {
        return;
      }
      if (addValue != "") {
        let sroCode = SROOfficeList2.find((x) => x.name == addValue).id;
        TempDetails = { ...TempDetails, sroCode };
      }
    } else if (addName == "regYear") {
      if (addValue.length > 4) {
        addValue = LinkDocument.regYear;
      }
    }
    setLinkDocument({ ...TempDetails, [addName]: addValue });
  };

  const validateCC = async () => {
    if (!isFormValid()) {
      ShowMessagePopup(false, "Please fill all required fields", "");
      return;
    }

    setShowAfter2003Msg(false);
    let result = await CallingAxios(getValidateCC(LinkDocument));
    if (result?.status) {
      ccreqDetails();
    } else {
      setShowAfter2003Msg(true);
      ShowMessagePopup(false, result?.message || "No Data Found", "");
    }
  };

  const ccreqDetails = async () => {
    let yr: any = new Date().getFullYear();
    yr = String(yr).substring(2, 4);
    let AppId =
      yr + "" + LinkDocument.sroCode + "" + Math.round(+new Date() / 1000);
    let data: any = {
      SR_CODE: LinkDocument.sroCode,
      DOCT_NO: LinkDocument.linkDocNo,
      REG_YEAR: LinkDocument.regYear,
      BOOK_NO: 1,
      USER_ID: LoginDetails.loginId,
      STATUS: "S",
      TIME_STAMP: new Date().toISOString().slice(0, 10),
      REQUESTED_ON: new Date().toISOString().slice(0, 10),
      REQUESTED_BY: LoginDetails.loginName,
      APP_ID: AppId,
      CC_FROM: "WRITER",
    };
    let result: any = await CallingAxios(UseSaveCCrequestDetails(data));

    if (result.status) {
      ShowMessagePopup(true, "CC Request saved successfully", "");
      router.push("/CCdashboardPage");
    } else {
      ShowMessagePopup(
        false,
        result.message
          ? result.message
          : "The Certified Copy request failed because the documents were not digitized prior to 1999. Please contact the concerned SRO.",
        "",
      );
    }
  };

  const isFormValid = () => {
    if (!LinkDocument.district) return false;
    if (!LinkDocument.sroOffice) return false;
    if (!LinkDocument.linkDocNo) return false;
    if (!LinkDocument.regYear) return false;

    return true;
  };

  return (
    <div className="PageSpacing">
      <Head>
        <title>CC Request</title>
      </Head>
      <Container>
        <Row>
          <Col lg={12} md={12} xs={12}>
            <form
              className={`${styles.mainContainer} ${styles.GetstartedInfo}`}
              onSubmit={(e) => {
                e.preventDefault();
                validateCC();
              }}
            >
              <div>
                <h2
                  className={` ${styles.getTitle} ${styles.HeadingText} ${styles.CertifiedText} text-center mt-3`}
                >
                  <u>CERTIFIED COPY (Upto {TO_DATE})</u>
                </h2>
              </div>
              <div className={`${styles.LinkDocInfo} ${styles.ccLinkdocInfo}`}>
                <Row>
                  <Col lg={6} md={6} xs={12} className="mb-2">
                    <TableText
                      label={"District [జిల్లా]"}
                      required={true}
                      LeftSpace={false}
                    />
                    <TableDropdownSRO
                      required={true}
                      options={DistrictList}
                      name={"district"}
                      value={LinkDocument.district}
                      onChange={onChange}
                    />
                  </Col>
                  <Col lg={6} md={6} xs={12}>
                    <TableText
                      label={
                        "Sub Registrar Office [సబ్ రిజిస్ట్రార్ కార్యాలయం]"
                      }
                      required={true}
                      LeftSpace={false}
                    />
                    <TableDropdownSRO
                      required={true}
                      options={SROOfficeList2}
                      name={"sroOffice"}
                      value={LinkDocument.sroOffice}
                      onChange={onChange}
                    />
                  </Col>
                  <Col lg={6} md={6} xs={12} className="mb-2">
                    <TableText
                      label={"Document No. [డాక్యుమెంట్ నెం.]"}
                      required={true}
                      LeftSpace={false}
                    />
                    <TableInputText
                      type="number"
                      placeholder="Enter Document No"
                      allowNeg={true}
                      maxLength={7}
                      required={true}
                      name={"linkDocNo"}
                      value={LinkDocument.linkDocNo}
                      onChange={onChange}
                    />
                  </Col>

                  <Col lg={6} md={6} xs={12}>
                    <TableText
                      label={"Registration Year [నమోదు సంవత్సరం]"}
                      required={true}
                      LeftSpace={false}
                    />
                    <TableInputText
                      type="number"
                      placeholder="Enter Registartion Year"
                      required={true}
                      name={"regYear"}
                      value={LinkDocument.regYear}
                      onChange={onChange}
                    />
                  </Col>
                </Row>
                <Row className="noteInfo">
                  <Col lg={12} md={12} xs={12}>
                    <h6>
                      Note: Only Book 1 documents can be downloaded. For Book 3
                      and Book 4, Please contact the SRO.
                    </h6>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col lg={12} md={12} xs={12}>
                    <div
                      className={`${styles.ProceedContainer} ${styles.Linkbtn}`}
                    >
                      <button
                        type="button"
                        className="proceedButton mx-2"
                        onClick={() => redirectToPage("/CCdashboardPage")}
                      >
                        Back
                      </button>
                      <button type="submit" className="proceedButton mb-0">
                        Submit
                      </button>
                    </div>
                  </Col>
                </Row>
                {showAfter2003Msg && (
                  <Row className="noteInfo mt-4 mb-3 g-0">
                    <Col lg={12} md={12} xs={12}>
                      <div
                        className="alert alert-info mb-0"
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span
                            style={{ fontSize: "14px", lineHeight: "20px" }}
                          >
                            If CC details are not found <strong>before {TO_DATE}</strong>,{" "}
                            please check the <strong>After {TO_DATE} Certified Copies list</strong>{" "}
                            by clicking the button.
                          </span>

                          <button
                            type="button"
                            className="proceedButton"
                            style={{
                              margin: "4px",
                              padding: "6px 14px",
                              fontSize: "13px",
                              height: "34px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => redirectToPage("/ccLandingpage")}
                          >
                            Click here
                          </button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CcLandingpage;
