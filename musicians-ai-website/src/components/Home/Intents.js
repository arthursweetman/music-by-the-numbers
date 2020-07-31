import React, { useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { Typography } from '@material-ui/core';
import './Home.css';

const intents = {
    WhereCanIFindYourMusic: "Where can I find your music?",
    ConnectIntent: "How can I connect?",
    PlaySongIntent: "Play a song!",
    CaptureIntent: "Unregistered",
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
        return (
            <div className='toolTip'>
                <p style={{margin:0}} >{`${intents[payload[0].payload.payload.key]}: ${payload[0].payload.payload.value}`}</p>
            </div>
        )
    }
}

const CustomLegend = (value) => {
    return <span>{intents[value]}</span>;
}

export const Intents = (props) => {
    var colors = ['#A19347','#8C9BF5','#152161','#FB4080'];
    return(
        <div>
        <Typography variant='h4'>Intents Used</Typography>
        <ResponsiveContainer
            minHeight={180}
            minWidth={180}
        >
            <PieChart margin={{top: 10, bottom: 5}}>
                <Pie data={props.intents} dataKey='value' nameKey='key'>
                    {
                        props.intents.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]}/>
                        ))
                    }
                </Pie>
                <Tooltip content={CustomTooltip} />
                <Legend layout='vertical' align='right' verticalAlign='middle' formatter={CustomLegend}/>
            </PieChart>
        </ResponsiveContainer>
        </div>
    )
}
Intents.propTypes = {
    intents: PropTypes.array.isRequired
}
export default Intents;