import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const useAuthRedirect = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedOut = localStorage.getItem('isLoggedOut') === 'true';
    if (!currentUser || isLoggedOut) {
      localStorage.removeItem('isLoggedOut'); 
      navigate('/login');
    }
  }, [currentUser, navigate]);
};

export default useAuthRedirect;
