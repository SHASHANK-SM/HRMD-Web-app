import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getEmployees,
  updateEmployeeProfile,
} from "../Services/hr-employees-management";

export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (
    { page = 1, search, department, status, token },
    { rejectWithValue }
  ) => {
    try {
      const response = await getEmployees({
        page,
        limit: 10,
        search,
        department,
        status,
        token,
      });

      if (response?.status) {
        return response.apiRes;
      } else {
        return rejectWithValue(response?.errMsg || "Failed to fetch employees");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, payload, token }, { rejectWithValue }) => {
    try {
      let response = await updateEmployeeProfile(id, payload, token);

      if (response?.status) {
        return response.apiRes;
      } else {
        return rejectWithValue(response?.errMsg || "Failed to update employee");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    employees: [],
    totalPages: 0,
    currentPage: 0,
    searchText: "",
    department: "",
    status: "",
    isLoading: false,
    error: "",
    singleEmployee: null,
  },
  reducers: {
    setDepartment(state, action) {
      state.department = action.payload;
      state.currentPage = 0;
    },
    setStatus(state, action) {
      state.status = action.payload;
      state.currentPage = 0;
    },
    setSearchText(state, action) {
      state.searchText = action.payload;
      state.currentPage = 0;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setSingleEmployee(state, action) {
      state.singleEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.employees;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleEmployee = action.payload; // 👈 Automatically update singleEmployee in store
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDepartment,
  setStatus,
  setSearchText,
  setCurrentPage,
  setSingleEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;
