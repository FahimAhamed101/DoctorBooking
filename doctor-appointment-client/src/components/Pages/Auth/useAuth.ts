import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const useAuth = () => {
  const { user, tokens, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  return {
    user,
    tokens,
    isAuthenticated,
  };
};