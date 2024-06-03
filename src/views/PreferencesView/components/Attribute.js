import React from "react";
import { Row, Col } from "react-bootstrap";
import "../../../App.css";
import SlideRange from "./SlideRange";
import PrioritySwitch from "./PrioritySwitch";

const Attribute = ({ attrName, sliderColor }) => {
  return (
    <Row
      style={{
        display: "flex",
        alignItems: "center",
        padding: "5px",
        height: "100%",
      }}
    >
      <Col xs={4}>{attrName}</Col>
      <Col xs={7}>
        <SlideRange sliderColor={sliderColor} attrName={attrName} />
      </Col>
      {/* <Col xs={1}>
        <PrioritySwitch attrName={attrName} />
      </Col> */}
    </Row>
  );
};

export default Attribute;
