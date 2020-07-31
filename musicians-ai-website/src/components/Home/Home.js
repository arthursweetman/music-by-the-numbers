import React from 'react';
import PropTypes from 'prop-types';
//Custom Imports
import NavBar from '../NavBar/NavBar';
import Usage from './Usage';
import NumUsers from './NumUsers';
import Map from './Map';
import SessionLengthPlot from './SessionLengthPlot';
import Intents from './Intents';
import Discoverability from './Discoverability';
import './Home.css';
//MUI
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles ({
    centerText: {
        textAlign: 'center',
    },
    container: {
        top: 65,
        position: 'relative',
    },
});

export const Home = (props) => {
    const classes = useStyles();
    return (
        <div>
            <NavBar />
            <Container className={classes.container}>
                    
                <Grid item xs={12} className={classes.centerText} style={{padding: '16px 0'}}>
                    <Paper>
                        <Typography variant='h3'>
                            Alexa Skill Usage
                        </Typography>
                    </Paper>
                </Grid>

                <Grid container spacing={1} justify='space-evenly' className={classes.centerText}>

                    <Grid container item spacing={2} xs={12} sm={5}>
                        <Grid item xs={12}>
                            <Paper>
                                <NumUsers 
                                    totalSessions={props.totalSessions}//optional
                                    totalUsers={props.totalUsers}//optional
                                    users30Days={props.users30Days}
                                    sessions30Days={props.sessions30Days}
                                    usersPrev30Days={props.usersPrev30Days}
                                    sessionsPrev30Days={props.sessionsPrev30Days}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper>
                                <Usage 
                                    dailyData={props.dailyData} 
                                    yearData={props.yearData}
                                    monthData={props.monthData}
                                    weekData={props.weekData}
                                    artist={props.artist}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper>
                                <Intents intents={props.intents}/>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container item spacing={2} xs={12} sm={5}>
                        <Grid item xs={12}>
                            <Paper>
                                <Map mapData={props.fanData} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper>
                                <SessionLengthPlot histogram={props.histogram}/>
                            </Paper>
                        </Grid>
                    </Grid>
                    
                    <Grid item xs={11} sm={2}>
                        <Paper>
                            <Discoverability discoverabilityData={props.discoverabilityData} artist={props.artist} />
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </div>
    );
}

Home.propTypes = {
    artist: PropTypes.string.isRequired,
    dailyData: PropTypes.array.isRequired,
    yearData: PropTypes.array.isRequired,
    monthData: PropTypes.array.isRequired,
    weekData: PropTypes.array.isRequired,
    totalUsers: PropTypes.number.isRequired,
    totalSessions: PropTypes.number.isRequired,
    histogram: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    users30Days: PropTypes.number.isRequired,
    sessions30Days: PropTypes.number.isRequired,
    usersPrev30Days: PropTypes.number.isRequired,
    sessionsPrev30Days: PropTypes.number.isRequired,
    discoverabilityData: PropTypes.array.isRequired,
    fanData: PropTypes.array.isRequired,
}

export default Home
