import React from 'react';
import NavBar from '../NavBar/NavBar';
import ReactLoading from 'react-loading';
import './loading.css';

export const LoadingScreen = () => {
    return(
        <div className='background'>
            <NavBar />
            <ReactLoading className="icon" type='bars' color='#FB4080' height='10%' width='10%'/>
        </div>
        
    )
}
export default LoadingScreen;