import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    upArrow: {
        color: '#00ab66',
    },
    downArrow: {
        color: '#cf142b'
    },
})

export const NumUsers = (props) => {
    const classes = useStyles();
    const sessionDifference = Math.abs(props.sessions30Days-props.sessionsPrev30Days); //Always positive
    const userDifference = Math.abs(props.users30Days-props.usersPrev30Days); //Always positive
    return(
        <div>
            <Grid container direction="row" justify="space-evenly">

                {/* Total Sessions */}
                <Grid item xs={6}>
                    <Typography variant="h5" align='center'>Total Sessions</Typography>
                    <Typography variant="h4" align='center'>{props.sessions30Days}</Typography>
                </Grid>

                {/* Sessions up/down arrow */}
                <Grid item xs={6}>
                    {props.sessions30Days >= props.sessionsPrev30Days ?
                        (<div>
                            <ArrowDropUpIcon fontSize='large' className={classes.upArrow} /> 
                            <Typography>Up {sessionDifference} from prev. 30 days</Typography>
                        </div>) :
                        (<div>
                            <ArrowDropDownIcon fontSize='large' className={classes.downArrow} />
                            <Typography>Down {sessionDifference} from prev. 30 days</Typography>
                        </div>) }
                </Grid>

                {/* Unique Users */}
                <Grid item xs={6}>
                    <Typography variant="h5" align='center'>Unique Users</Typography>
                    <Typography variant="h4" align='center'>{props.users30Days}</Typography>
                </Grid>

                {/* Users up/down arrow */}
                <Grid item xs={6}>
                    {props.users30Days >= props.usersPrev30Days ?
                        (<div>
                            <ArrowDropUpIcon fontSize='large' className={classes.upArrow} /> 
                            <Typography>Up {userDifference} from prev. 30 days</Typography>
                        </div>) :
                        (<div>
                            <ArrowDropDownIcon fontSize='large' className={classes.downArrow} />
                            <Typography>Down {userDifference} from prev. 30 days</Typography>
                        </div>) }
                </Grid>

            </Grid>
        </div>
    )
}

NumUsers.propTypes = {
    totalSessions: PropTypes.number,
    totalUsers: PropTypes.number,
    users30Days: PropTypes.number.isRequired,
    sessions30Days: PropTypes.number.isRequired,
    usersPrev30Days: PropTypes.number.isRequired,
    sessionsPrev30Days: PropTypes.number.isRequired,
}

export default NumUsers;