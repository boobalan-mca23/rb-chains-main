import axios from 'axios';
import {REACT_APP_BACKEND_SERVER_URL} from '../config/config.js'
// create Lot
 export const createLot=async(initialWeight,touchValue)=>{
     const response=await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/lot/lotinfo`,{initialWeight:initialWeight,touchValue:touchValue})
     return response.data;
}  

//getAllLot Data
export const getAllLot=async()=>{
    const response=await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/process/processes`)
    return response.data.data
}

//SaveLot Value
export const saveLot=async(lotdata)=>{

    const response=await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/process/saveProcess`,{lotdata:lotdata})
    return response.data.data;
 
}

