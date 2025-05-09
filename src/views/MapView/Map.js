import React, {useRef, useState, useEffect, useCallback, useMemo} from "react";
import {MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/Map.css";
import Legend from "./components/Legend";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import LeafletTooltip from "../../components/LeafletPopup";
import {create} from "zustand";
import useLoadHistory from "../../api/history/useLoadHistory";
import useLoadMeWithGroups from "../../api/useLoadMeWithGroups";
import useSelectedList from "../../api/useSelectedList";
import useVisits from "../../api/useVisits";
import { useAuthContextSupabase } from "../../context/AuthContextSupabase";

const position = [51.0967884, 5.9671304];

export const useReferencedCountry = create((set) => ({
  countryId: null,
  setCountry: (countryId) => {
    set({ countryId })
  },
  resetCountry: () => {
    set({ countryId: null })
  }
}));

const Map = ({ setActiveResult }) => {
  const { user } = useAuthContextSupabase();
  const { visits, fetchVisits } = useVisits();
  const { data: historyData, loading } = useLoadHistory({
    userId: user?.id,
  });
  const isLoading = !historyData;
  const [map, setMap] = useState(null);
  const countries = useTravelRecommenderStore((state) => state.countries);
  const travelStore = useTravelRecommenderStore();
  const geoJsonLayer = useRef(null);
  const mapLayers = useRef([]);
  const {
    countryId: referencedCountryId,
    resetCountry: resetReferencedCountry
  } = useReferencedCountry();

  const { selectedList } = useSelectedList();
  const listEmoji = selectedList.emoji;
  const listRegions = selectedList.regions;
  const [geoJsonKey, setGeoJsonKey] = useState(0); // Key to force GeoJSON re-render


  const { data: groupsData, loading: groupsLoading } = useLoadMeWithGroups();

  useEffect(() => {
    if (referencedCountryId) {
      onCountryPopupOpen(referencedCountryId);
      resetReferencedCountry();
    }
  }, [referencedCountryId]);

  useEffect(() => {
    if (geoJsonLayer.current) {
      geoJsonLayer.current.clearLayers().addData(countries);
    }
  });

  const countryStyle = {
    fillOpacity: 1,
    color: "#868685",
    weight: 1,
  };

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  useEffect(() => {

    if (user && geoJsonLayer.current && visits.length > 0) {
      geoJsonLayer.current.eachLayer((layer) => {
        const countryId = layer.feature.properties.result.id;    
        const visited = visits.some((visit) => parseInt(visit.region_id) === countryId);
        if (visited) {
          layer.setStyle({
            weight: 5,
            color: "#868686",
            fillOpacity: 0.7,
          });
        }
      });
    }
  }, [visits, countryStyle]);


  /**
   *
   * @type {(function($ObjMap, *): void)|*}
   */
  const onEachCountry = useCallback((country, layer) => {
    layer.options.fillColor = "#7CBA43"//getColor(score);
    if(listRegions && listRegions.map((regions) => regions.value.id).includes(country.properties.result.id)){
      layer.options.fillColor = "#ff9933";
      layer.bindTooltip(`
        <div>
          <h4>${listEmoji}</h4>
        </div>`, {
      permanent: true,
      opacity: 1,
      direction: "center",
    });
    }

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      dblclick: clickCountry,
      click: (event) => onOpenPopup(event, country),
    });

    // add references to the leaflet ids to for the programmatic event handling
    if (country.properties.result.id) {
      setTimeout(() => {
        layer.id = country.properties.result.id;
        mapLayers.current[country.properties.result.id] = layer._leaflet_id;
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, listRegions]);


  const onCountryPopupOpen = (countryId) => {
    const layer = geoJsonLayer.current.getLayer(mapLayers.current[countryId]);
    const { lat, lng } = layer.getCenter();
    map.flyTo([lat,lng]);
    map.once('moveend', () => {
      layer.fireEvent('click', {
        latlng: { lat, lng }
      });
    });
  };



  const highlightFeature = (e) => {
    const layer = e.target;
    const visited = layer.options.weight === 5;
    layer.setStyle({
      weight: 5,
      color: "white",
      fillOpacity: visited ? 0.8 : 0.7,
    });
  };

  const resetHighlight = (e) => {
    const layer = e.target;
    const visited = layer.options.fillOpacity === 0.8;
    layer.setStyle({
      fillOpacity: visited ? 0.7 : 1,
      color: "#868686",
      weight: visited ? 5 : 1,
    });
  };

  const [tooltipPosition, setTooltipPosition] = useState([0,0]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedResult, setSelectedResult] = useState();

  /**
   *
   * @param {Object} event
   * @param {Object} country
   */
  const onOpenPopup = (event, country) => {
    if (!event.latlng) {
      return;
    }
    setOpenPopup(true);
    setTooltipPosition([event.latlng?.lat, event.latlng?.lng]);
    setSelectedResult(country.properties.result);
  }

  const onPopupReset = () => {
    setOpenPopup(false);
  }

  const clickCountry = (e) => {
    let ind = countries.findIndex(
      (r) => r.properties.u_name === e.target.feature.properties.u_name
    );
    if (ind < 10) {
      setActiveResult(ind);
    } else {
      setActiveResult(-1);
    }
  };

  const getColor = (d) => {
    return d > 90
      ? "#109146"
      : d > 70
      ? "#7CBA43"
      : d > 60
      ? "#FFCC06"
      : d > 50
      ? "#F58E1D"
      : d >= 0
      ? "#BF1E24"
      : "#fff";
  };
  useEffect(() => {
    setGeoJsonKey((prevKey) => prevKey + 1);
  }, [listRegions]);

  if (loading || isLoading) {
    return <div>Loading user data...</div>;
  }
  return (
    <div>
      <div>
        <MapContainer
          style={{height: "100vh", width: "auto"}}
          zoom={4}
          id={'map'}
          center={position}
          ref={setMap}
          doubleClickZoom={false}
        >
          <GeoJSON
            key={geoJsonKey}
            ref={geoJsonLayer}
            style={countryStyle}
            data={countries}
            onEachFeature={onEachCountry}
          />
          <LeafletTooltip
            map={map}
            data={{
              position: tooltipPosition,
            }}
            isActive={openPopup}
            country={selectedResult}
            reset={onPopupReset}
          />
          <Legend map={map}/>
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
