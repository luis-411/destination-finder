import React, { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";
import "../../../styles/App.css";
import { Col } from "react-bootstrap";
import useRegions from "../../../api/useRegions";

const RegionDataView = ({ regionId, regionName, onSave }) => {
  const { fetchRegionById, updateRegion, addRegion } = useRegions();
  const [rating, setRating] = useState("0");
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [regionData, setRegionData] = useState(null);
  const commentRef = useRef(null);

  useEffect(() => {
    const loadRegionData = async () => {
      const fetchedRegionData = await fetchRegionById(regionId);
      if (fetchedRegionData) {
        setRating(fetchedRegionData.rating || "0");
        setComment(fetchedRegionData.comment || "");
        setRegionData(fetchedRegionData);
      }
      else {
        setComment("");
        setRating(0);
        setRegionData(null);
      }
    };

    loadRegionData();
  }, [regionId]);

  const handleStarClick = async (index) => {
    if (rating === index.toString()) {
      setRating("0"); // Reset rating if the same star is clicked again
      if(regionData){
        setRegionData({ ...regionData, rating: "0" });
        await updateRegion(regionId, { rating: "0" });
      }
      else{
        await addRegion({ 
            id: regionId, 
            rating: "0", 
            comment: "",
            name: regionName,});
      }
    } else {
        setRating(index.toString());
        if(regionData){
          setRegionData({ ...regionData, rating: index.toString() });
          await updateRegion(regionId, {rating: index.toString()});
        }
        else{
          await addRegion({ 
              id: regionId, 
              rating: index.toString(), 
              comment: "",
              name: regionName,});
        }
    }
  };

  const handleStarHover = (index) => {
    setHover(index);
  };

  const handleStarHoverOut = () => {
    setHover(0);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    //setRegionData((prev) => ({ ...prev, comment: e.target.value })); // Update local state
    if (!showSaveButton) {
      setShowSaveButton(true);
    }
    if (e.target.value === "") {
      setShowSaveButton(false);
    }
  };

  const handleSave = async () => {
    setComment(commentRef.current.value);
    //await updateRegion(regionId, { comment });
    if (regionData) {
      // Update the existing region
      const updatedRegion = { ...regionData, comment: comment, rating: rating };
      setRegionData(updatedRegion);
      await updateRegion(regionId, {updatedRegion});
    } else {
      // Add a new region
      const newRegion = { 
        id: regionId, 
        rating: rating, 
        comment: comment,
        name: regionName,
      };
      setRegionData(newRegion);
      await addRegion(newRegion);
    }
    setShowSaveButton(false);
  };

  return (
    <div>
      <Col style={{ textAlign: "left", flexBasis: "10%", fontSize: '10px' }} className='mb-1'>
        Region Rating
      </Col>
      <div className="d-flex flex-row align-items-center justify-content-center gap-1">
        {[...Array(5)].map((_, index) => {
          const starIndex = index + 1;
          return (
            <FaStar
              key={starIndex}
              size={24}
              color={starIndex <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              onMouseLeave={handleStarHoverOut}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </div>
      <Col style={{ textAlign: "left", fontSize: '10px' }} className='mb-1 mt-2'>
        Comments
      </Col>
      <textarea
        ref={commentRef}
        className="comment-box"
        placeholder="Add your comment here..."
        value={comment}
        onChange={handleCommentChange}
        style={{ backgroundColor: "transparent", color: "white", width: "100%", maxWidth: "500px", height: "100px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "1rem" }}
      />
      {showSaveButton && (
        <div className="d-flex justify-content-center align-items-center">
          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default RegionDataView;