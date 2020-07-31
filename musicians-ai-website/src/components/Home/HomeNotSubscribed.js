import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";
import NavBar from '../NavBar/NavBar';
import Usage from './Usage';
import NumUsers from './NumUsers';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const useStyles = makeStyles ({
    centerText: {
        textAlign: 'center',
    },
    container: {
        top: 65,
        position: 'relative',
    },
    button: {
        textAlign: 'center',
        backgroundColor: 'tan',
        marginTop: '4px',
        marginBottom: '4px',
    }
});

const HomeUnsubscribed = (props) => {
    let history = useHistory();
    const classes = useStyles();

    function handleClick() {
        history.push('./payment');
    }

    return(
        <div>
            <NavBar />
            <Container className={classes.container}>
                    
                <Grid item xs={12} className={classes.centerText} style={{padding: '16px 0'}} >
                    <Paper>
                        <Typography variant='h3'>
                            Alexa Skill Usage
                        </Typography>
                    </Paper>
                </Grid>

                <Grid container spacing={1} justify='space-evenly' className={classes.centerText}>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
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
                            <Typography variant={"h5"}>
                                Want to see more information?
                            </Typography>
                            <Button className={classes.button} onClick={handleClick}>
                                Subscribe
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

            </Container>
        </div>
    )
}
HomeUnsubscribed.propTypes = {
    artist: PropTypes.string.isRequired,
    dailyData: PropTypes.array.isRequired,
    yearData: PropTypes.array.isRequired,
    monthData: PropTypes.array.isRequired,
    weekData: PropTypes.array.isRequired,
    totalUsers: PropTypes.number.isRequired,
    totalSessions: PropTypes.number.isRequired,
    users30Days: PropTypes.number.isRequired,
    sessions30Days: PropTypes.number.isRequired,
    usersPrev30Days: PropTypes.number.isRequired,
    sessionsPrev30Days: PropTypes.number.isRequired,
}
export default HomeUnsubscribed;