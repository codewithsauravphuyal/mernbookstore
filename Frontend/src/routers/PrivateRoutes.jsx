import {Navigate} from "react-router-dom"
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

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

PrivateRoutes.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoutes;