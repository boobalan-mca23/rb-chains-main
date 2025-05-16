import axios from 'axios';
import {REACT_APP_BACKEND_SERVER_URL} from '../config/config.js'
// create Lot
 export const createLot=async(initialWeight,touchValue,today)=>{
     const response=await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/lot/lotinfo`,{initialWeight:initialWeight,touchValue:touchValue,today:today})
     return response.data;
}  

//getAllLot Data
export const getAllLot=async()=>{
    const response=await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/process/processes`)
    return response.data.data
}

//SaveLot Value
export const saveLot=async(lotdata)=>{

  try{
      const response=await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/process/saveProcess`,{lotdata:lotdata})
      return response;
  }catch(error){
    if (error.response) {
        if (error.response.status === 400 && error.response.data.statusMsg === "noMasterId") {
          alert(error.response.data.message);
          console.log(error.response)
        } else {
          alert(error.response.data.message || "Something went wrong.");
        }
      } else {
        alert("No response from server. Please check your internet connection.");
      }
  }
 
}

//getLotDatewise
export const getLotDatewise=async(fromDate,toDate)=>{

    const response=await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/process/getLotsByDateRange`,{"fromDate":fromDate,"toDate":toDate})
    return response;
 
}

export const getProductName=async()=>{
    const response=await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getJewelType`)
    return response.data.allJewel
}


  


