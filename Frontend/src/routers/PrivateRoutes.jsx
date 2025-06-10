import React from 'react'
import  {useAuth} from "../context/AuthContext"
import {Navigate} from "react-router-dom"
const PrivateRoutes = ({children}) => {

  const {currentUser,loading}= useAuth()


  if(loading) return <h1>loading ... </h1>

  if(currentUser){
    return children;
  }
  return (
     <Navigate  to="/login" />
  )
}

export default PrivateRoutes;