import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {LineChart, XAxis, YAxis, Label, Tooltip, Line, ResponsiveContainer} from 'recharts';
import Typography from '@material-ui/core/Typography';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

const data = {
    "week": 'weekData',
    "month": 'monthData',
    "year": 'yearData',
    "all": 'dailyData',
}

export const Usage = (props) => {

    const [value, setValue] = useState('week');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const TabOutput = ({targetData}) => {
        return(
            <ResponsiveContainer
                minHeight={180}
                minwdth={180}
            >
                <LineChart
                    data={targetData}
                    margin={{ top: 10, right: 25, left: 0, bottom: 15 }}
                >
                    <XAxis dataKey="date" interval = "preserveStartEnd" >
                        <Label value = "Date" position="bottom" offset={0}/>
                    </XAxis>
                    <YAxis domain={[0,'datamax']} >
                        <Label value = "No. of Sessions" position='insideBottomLeft' offset={20} angle={-90} />
                    </YAxis>
                    <Tooltip />
                    <Line type="monotone" dot={false} dataKey="cumulativeSessions" stroke="#3F51B5" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        )
    }

    return (
        <div>
            <Typography variant='h4'>Usage</Typography>
            <Tabs 
                value={value}
                onChange={handleChange} 
                indicatorColor='primary'
                textColor='primary'
                variant="scrollable" 
                scrollButtons='auto'
            >
                <Tab label='Week' value='week' />
                <Tab label='Month' value='month' />
                <Tab label='Year' value='year' />
                <Tab label='All' value='all' />
            </Tabs>
            <TabOutput targetData={props[data[value]]} />

        </div>
    )
}

Usage.propTypes = {
    dailyData: PropTypes.array.isRequired,
    yearData: PropTypes.array.isRequired,
    monthData: PropTypes.array.isRequired,
    weekData: PropTypes.array.isRequired,
    artist: PropTypes.string.isRequired,
}

export default Usage;