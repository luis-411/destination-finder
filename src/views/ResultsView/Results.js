import React, { useState, useEffect, useRef } from "react";
import Accordion from "react-bootstrap/Accordion";
import "../../App.css";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import { useAuthContext } from "../../context/AuthContext";
import ResultItem from "./ResultItem";

export const Results = ({ activeResult}) => {
  const {user} = useAuthContext();
  const results = useTravelRecommenderStore((state) => state.results);
  const [activeIndex, setActiveIndex] = useState(-1);
  const accordElem = useRef(null);

  useEffect(() => {
    if (results.length > 0) {
      if (activeResult === activeIndex) {
        setActiveIndex(-1);
      } else {
        setActiveIndex(activeResult);
        accordElem.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "start",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResult]);

  return (
    <div style={{ padding: "10px 0", height: "100%", overflow: "hidden" }}>
      <p style={{ textAlign: "left" }}>Best destinations for {user?user.username: "you"}:</p>
      {results.length > 0 ? (
        <div style={{ overflow: "auto", height: "90%" }} ref={accordElem}>
          <Accordion activeKey={activeIndex}>
            {results?.map((item, index) => (
              <ResultItem
                item={item}
                accordElem={accordElem}
                index={index}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            ))}
          </Accordion>
        </div>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            flexDirection: "column",
          }}
        >
          <p style={{ fontWeight: "bold", color: "red" }}>No results found!</p>
        </div>
      )}
    </div>
  );
};
