


// http://localhost:1337/api/users/me?populate=coverPhoto,profilePhoto
// needed to retrieve full information of the user
import useAxios from "axios-hooks";
import {useToken} from "../components/AuthProvider/AuthProvider";

const useLoadMe = () => {
  const token = useToken.getState().token;
  return useAxios({
    url: `${process.env.REACT_APP_BACKEND_URL}/users/me?populate=coverPhoto,profilePhoto`,
    headers: {
      Authorization: `bearer ${token}`,
    },
  });
};

export default useLoadMe;