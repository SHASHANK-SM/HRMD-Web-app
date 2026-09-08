import { ToastContainer } from "react-toastify";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginScreen from "./feature/auth/Screens/LoginScreen";
import HrDashboard from "./feature/hr/Screens/HrDashboard";
import { ProtectedRoute } from "./Layout/ProtectedRoute";
import EmployeeLayout from "./Layout/EmployeeLayout";
import EmployeeDashboardScreen from "./feature/employee/Screens/EmployeeDashboardScreen";
import EmpPayslipScreen from "./feature/employee/Screens/EmpPayslipScreen";
import EmpLeavesScreen from "./feature/employee/Screens/EmpLeavesScreen";
import LeavesManagementScreen from "./feature/hr/Screens/LeavesManagementScreen";
import HrLayout from "./Layout/HrLayout";
import HrEmployeeManagentScreen from "./feature/hr/Screens/HrEmployeeManagentScreen";
import HrAttendanceScreen from "./feature/hr/Screens/HrAttendanceScreen";
import HrPayslipScreen from "./feature/hr/Screens/HrPayslipScreen";
import HrDocumentsScreen from "./feature/hr/Screens/HrDocumentsScreen";
import HrReportsScreen from "./feature/hr/Screens/HrReportsScreen";
import HrSettingsScreen from "./feature/hr/Screens/HrSettingsScreen";
import EmployeeAttendanceScreen from "./feature/employee/Screens/EmployeeAttendanceScreen";
import EmployeeDocumentsScreen from "./feature/employee/Screens/EmployeeDocumentsScreen";
import EmployeeNotificationsScreen from "./feature/employee/Screens/EmployeeNotificationsScreen";
import EmployeeProfileScreen from "./feature/employee/Screens/EmployeeProfileScreen";
import HrNotificationsScreen from "./feature/hr/Screens/HrNotificationsScreen";

import HrPayrollList from "./feature/hr/Screens/HrPayrollList";

import SignupScreen from "./feature/auth/Screens/SignupScreen";
import CompanyRegistrationScreen from "./feature/auth/Screens/CompanyRegistrationScreen";
import HomeScreen from "./feature/auth/Screens/HomeScreen";

function App() {
  return (
    <div className="flex flex-col w-full  overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={5000} // 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/hr-signin" element={<LoginScreen />} />
        <Route path="/employee-signin" element={<LoginScreen />} />
        <Route
          path="/company-register"
          element={<CompanyRegistrationScreen />}
        />
        <Route path="/hr-signup" element={<CompanyRegistrationScreen />} />
        <Route
          path="/signup/:empId/:email/:designation"
          element={<SignupScreen />}
        />
        <Route element={<ProtectedRoute allowedRoles={["Hr"]} />}>
          <Route element={<HrLayout />}>
            <Route path="/hr-dashboard" element={<HrDashboard />} />
            <Route path="/hr-attendance" element={<HrAttendanceScreen />} />
            <Route
              path="/hr-leave-management"
              element={<LeavesManagementScreen />}
            />
            <Route
              path="/employees-details"
              element={<HrEmployeeManagentScreen />}
            />
            <Route path="/hr-payroll-management" element={<HrPayrollList />} />
            <Route path="/hr-payslips" element={<HrPayslipScreen />} />
            <Route path="/hr-documents" element={<HrDocumentsScreen />} />
            <Route path="/hr-reports" element={<HrReportsScreen />} />
            <Route
              path="/hr-notifications"
              element={<HrNotificationsScreen />}
            />
            <Route path="/hr-settings" element={<HrSettingsScreen />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
          <Route element={<EmployeeLayout />}>
            <Route
              path="/employee-dashboard"
              element={<EmployeeDashboardScreen />}
            />
            <Route
              path="/employee-attendance"
              element={<EmployeeAttendanceScreen />}
            />
            <Route path="/payslip-management" element={<EmpPayslipScreen />} />
            <Route path="/employee-leaves" element={<EmpLeavesScreen />} />
            <Route
              path="/employee-documents"
              element={<EmployeeDocumentsScreen />}
            />
            <Route
              path="/employee-notifications"
              element={<EmployeeNotificationsScreen />}
            />
            <Route
              path="/employee-profile"
              element={<EmployeeProfileScreen />}
            />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
