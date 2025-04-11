import React from 'react'
import './Master.css'
import { Button } from "@mui/material";
import { Link } from 'react-router-dom';

const Master = () => {
 

  return (
    <> 
    <div className='button-style'> 
    <Link to={'/customer'}> 
    <Button  > Customer </Button> </Link>
    <Link to={'/item'} > 
    <Button> Item </Button>
    </Link>
   
    </div>
    </>

  )
}

export default Master
