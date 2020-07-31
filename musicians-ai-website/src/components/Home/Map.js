import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Typography } from '@material-ui/core';
import { scaleQuantile } from "d3-scale";
import ReactTooltip from "react-tooltip";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3.0.0/states-10m.json";

export const Map = ({ mapData }) => {
  const [content, setContent] = useState("");

  const colorScale = scaleQuantile()
    .domain(mapData.map(d => d.value))
    .range([
      // Go to: https://colordesigner.io/gradient-generator
     '#f3dfe2',
     '#f7d0d7',
     '#fac1cb',
     '#fcb1c0',
     '#fda1b5',
     '#fe91aa',
     '#fe809f',
     '#fe6d95',
     '#fd598a',
     '#fb4080',
  ]);

  return(
    <div>
      <Typography variant='h4'>Your Fanbase</Typography>
      <ComposableMap data-tip="" projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const cur = mapData.find(s => s.key === geo.properties.name);
              return(
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={cur ? colorScale(cur.value) : "#EEE"}
                  onMouseEnter={() => {
                    const state = geo.properties.name;
                    setContent(state + ": " + (cur ? cur.value : 0) );
                  }}
                  onMouseLeave={() => {
                    setContent("");
                  }}
                />
              )
              
              })
          }
        </Geographies>
      </ComposableMap>
      <ReactTooltip>{content}</ReactTooltip>
    </div>
  )
}
Map.propTypes = {
    mapData: PropTypes.array.isRequired,
}
export default Map;