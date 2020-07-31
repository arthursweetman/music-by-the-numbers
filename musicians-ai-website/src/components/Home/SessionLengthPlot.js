import React from 'react';
import PropTypes from 'prop-types';
import {ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Label} from 'recharts';
import Typography from '@material-ui/core/Typography';
import './Home.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
        return (
            <div className='toolTip'>
                <p style={{margin:0}} >{`${label} seconds`}</p>
                <p style={{margin:0}} >{`Number of Sessions: ${payload[0].payload.value}`}</p>
            </div>
        )
    }
}

export const SessionLengthPlot = (props) => {
    return(
        <div>
        <Typography variant='h4'>Session Lengths</Typography>
        <ResponsiveContainer
            minWidth={180}
            minHeight={180}
        >
            <BarChart 
                data={props.histogram}
                barCategoryGap={0}
                margin={{top: 10, right: 20, left: 15, bottom: 15}}
            >
                <XAxis label={{ value: "Amount of Time (seconds)", position: 'insideBottom', offset: -5 }} 
                    dataKey="key" type='number' tickCount={10} domain={[0,'datamax']} 
                />
                <YAxis>
                    <Label value="No. of Sessions" position="insideBottomLeft" offset={15} angle={-90}/>
                </YAxis>
                <Tooltip content={CustomTooltip} />
                <Bar dataKey="value" fill="#152161" />
            </BarChart>
        </ResponsiveContainer>
        </div>
    )
}

SessionLengthPlot.propTypes = {
    histogram: PropTypes.array.isRequired
}

export default SessionLengthPlot;