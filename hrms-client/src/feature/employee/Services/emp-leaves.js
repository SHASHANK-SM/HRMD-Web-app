import { API } from "../../../Core/url";
import { errorMsgApi, successfully } from "../../../Core/toasts";

/**
 * Employee: Apply for leave
 *
 * Backend:
 * POST /leaves
 *
 * Supports multipart/form-data when a document is attached.
 */
export const postLeaveApi = async ({ data }) => {
  try {
    const formData = new FormData();

    formData.append("leaveType", data.leaveType);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("numberOfDays", String(data.numberOfDays));
    formData.append("reason", data.reason);

    if (data.document?.[0]) {
      formData.append("document", data.document[0]);
    }

    const response = await API.post("/leaves", formData);

    successfully(
      response?.data?.message || "Leave applied successfully"
    );

    return {
      status: true,
      apiRes: response.data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message ||
      "Something went wrong while applying for leave";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};

/**
 * Employee: Get leave history
 *
 * Backend:
 * GET /leaves
 */
export const getLeavesApi = async ({ date }) => {
  try {
    const params = {};

    if (date) {
      params.date = date;
    }

    const response = await API.get("/leaves", {
      params,
    });

    return {
      status: true,
      apiRes: response.data,
    };
  } catch (error) {
    const errMsg =
      error?.response?.data?.message ||
      "Something went wrong while fetching leaves";

    errorMsgApi(errMsg);

    return {
      status: false,
      errMsg,
    };
  }
};