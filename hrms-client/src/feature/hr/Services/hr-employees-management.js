import { errorMsgApi } from "../../../Core/toasts";
import { API } from "../../../Core/url";

export const getEmployees = async ({
  page,
  limit,
  department,
  status,
  search,
}) => {
  const queryParams = new URLSearchParams();

  if (page) queryParams.append("page", page);
  if (limit) queryParams.append("limit", limit);
  if (status) queryParams.append("status", status);
  if (department) queryParams.append("department", department);
  if (search) queryParams.append("search", search);

  try {
    const res = await API.get(`/employees?${queryParams.toString()}`);

    return {
      status: true,
      apiRes: res?.data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message || "Failed to Fetch Employees";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};

export const addNewEmployeeApi = async ({ apiData }) => {
  try {
    const res = await API.post("/employees", apiData);

    return {
      status: true,
      apiRes: res?.data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message || "Failed to Add Employee";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};

export const updateEmployeeProfile = async (id, payload) => {
  try {
    const { data } = await API.put(`/employees/${id}`, payload);

    return {
      status: true,
      apiRes: data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message || "Failed to Update Employee";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};