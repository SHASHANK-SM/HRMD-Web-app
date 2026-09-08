import { errorMsgApi } from "../../../Core/toasts";
import { API } from "../../../Core/url";

export const hrLeavesGetApi = async ({
  page,
  limit,
  status,
  leaveType,
}) => {
  const queryParams = new URLSearchParams();

  if (page) queryParams.append("page", page);
  if (limit) queryParams.append("limit", limit);
  if (status) queryParams.append("status", status);
  if (leaveType) queryParams.append("leaveType", leaveType);

  try {
    const res = await API.get(`/leaves/hr?${queryParams.toString()}`);

    return {
      status: true,
      apiRes: res?.data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message || "Something went Wrong";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};

export const leaveStatusChange = async ({
  id,
  status,
  hrNote,
}) => {
  try {
    const res = await API.patch(
      `/leaves/${id}/review`,
      { status, hrNote }
    );

    return {
      status: true,
      apiRes: res?.data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message || "Something went Wrong";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};