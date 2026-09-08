import auth from "../feature/auth/Slices/loginSlice";
import employeeList from "../feature/hr/Slices/HrEmployeeSlice";
import profile from "../feature/auth/Slices/profileSlice";

const RootReducer = {
  auth,
  employeeList,
  profile,
};
export default RootReducer;
