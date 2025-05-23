import React, { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";
import "../../../styles/App.css";
import { Col } from "react-bootstrap";
import useRegions from "../../../api/useRegions";
import useFeatures from "../../../api/useFeatures";

const RegionDataView = ({ regionId, regionName }) => {
  const { features } = useFeatures();
  const { fetchRegionById, updateRegion, addRegion } = useRegions();
  const [rating, setRating] = useState("0");
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [regionData, setRegionData] = useState(null);
  const [dataId, setDataId] = useState(null);
  const commentRef = useRef(null);

  const [emojiRating, setEmojiRating] = useState(null);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);

  const [sliderValue, setSliderValue] = useState("0");

  const emojiOptions = ["👍", "😍", "😎", "😐", "👎"];

  const handleEmojiClick = async (emoji) => {
    if (emoji === emojiRating) {
      if(regionData){
        setRegionData({ ...regionData, rating: "" });
        await updateRegion(dataId, { rating: "" });
      }
      else{
        await addRegion({ 
            region_id: regionId, 
            rating: "", 
            comment: "",
            name: regionName,});
      }
      setEmojiRating(null); // Reset emoji rating if the same emoji is clicked again
    }
    else {
      if(regionData){
          setRegionData({ ...regionData, rating: emoji });
          await updateRegion(dataId, {rating: emoji});
        }
        else{
          await addRegion({ 
              region_id: regionId, 
              rating: emoji, 
              comment: "",
              name: regionName,});
        }
      setEmojiRating(emoji);
    }
  };

  const handleEmojiHover = (emoji) => {
    setHoveredEmoji(emoji);
  };

  const handleEmojiHoverOut = () => {
    setHoveredEmoji(null);
  };

  useEffect(() => {
    const loadRegionData = async () => {
      const fetchedRegionData = await fetchRegionById(regionId);
      if (fetchedRegionData) {
        setDataId(fetchedRegionData.id);
        setRating(fetchedRegionData.rating || "0");
        setEmojiRating(fetchedRegionData.rating || "");
        setSliderValue(fetchedRegionData.rating || "0");
        setComment(fetchedRegionData.comment || "");
        setRegionData(fetchedRegionData);
      }
      else {
        setDataId(null);
        setComment("");
        setRating("0");
        setEmojiRating("");
        setSliderValue("0");
        setRegionData(null);
      }
    };

    loadRegionData();
  }, [regionId, fetchRegionById]);

  const handleStarClick = async (index) => {
    if (rating === index.toString()) {
      setRating("0"); // Reset rating if the same star is clicked again
      if(regionData){
        setRegionData({ ...regionData, rating: "0" });
        await updateRegion(dataId, { rating: "0" });
      }
      else{
        await addRegion({ 
            region_id: regionId, 
            rating: "0", 
            comment: "",
            name: regionName,});
      }
    } else {
        setRating(index.toString());
        if(regionData){
          setRegionData({ ...regionData, rating: index.toString() });
          await updateRegion(dataId, {rating: index.toString()});
        }
        else{
          await addRegion({ 
              region_id: regionId, 
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
      await updateRegion(dataId, updatedRegion);
    } else {
      // Add a new region
      const newRegion = { 
        region_id: regionId, 
        rating: rating, 
        comment: comment,
        name: regionName,
      };
      setRegionData(newRegion);
      await addRegion(newRegion);
    }
    setShowSaveButton(false);
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setSliderValue(value);
    setRating(value); // keep rating in sync for saving
  };

  const handleSliderCommit = async () => {
    if(regionData){
      setRegionData({ ...regionData, rating: sliderValue });
      await updateRegion(dataId, { rating: sliderValue });
    } else {
      await addRegion({
        region_id: regionId,
        rating: sliderValue,
        comment: "",
        name: regionName,
      });
    }
  };

  return (
    <div>
    {features.rating === "star" && (
      <>
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
      </>)}
      {features.rating === "emoji" && (
        <>
        <Col style={{ textAlign: "left", flexBasis: "10%", fontSize: '10px' }} className='mb-1 mt-2'>
        Region Rating
      </Col>
      <div className="d-flex flex-row align-items-center justify-content-center gap-1">
        {emojiOptions.map((emoji) => (
          <span
            key={emoji}
            style={{
              fontSize: "24px",
              cursor: "pointer",
              opacity: emoji === (hoveredEmoji || emojiRating) ? 1 : 0.5,
            }}
            onClick={() => handleEmojiClick(emoji)}
            onMouseEnter={() => handleEmojiHover(emoji)}
            onMouseLeave={handleEmojiHoverOut}
          >
            {emoji}
          </span>
        ))}
      </div>
    </>)}
    {features.rating === "slider" && (
      <>
        <Col style={{ textAlign: "left", flexBasis: "10%", fontSize: '10px' }} className='mb-1 mt-2'>
          Region Rating
        </Col>
        <div className="d-flex flex-row align-items-center justify-content-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            style={{ width: "100%", accentColor: "#2e6e85" }}
          />
          <span style={{ minWidth: "32px", textAlign: "center", color: "white", fontWeight: "bold" }}>{sliderValue}</span>
        </div>
      </>
    )}
      <Col style={{ textAlign: "left", fontSize: '10px' }} className='mb-1 mt-2'>
        Comments
      </Col>
      <textarea
        ref={commentRef}
        className="comment-box"
        placeholder="Add your comment here..."
        value={comment}
        onChange={handleCommentChange}
        style={{ backgroundColor: "transparent", color: "white", width: "100%", maxWidth: "500px", height: "100px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
      />
      {showSaveButton && (
        <div className="d-flex justify-content-center align-items-center mt-2">
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