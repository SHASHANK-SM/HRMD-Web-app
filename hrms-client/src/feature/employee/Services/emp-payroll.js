import { errorMsgApi } from "../../../Core/toasts";
import { API } from "../../../Core/url";

export const getPayrollApi = async ({ page, limit, month, status }) => {
  try {
    const params = {};

    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (month) params.month = month;
    if (status) params.status = status;

    const res = await API.get("/payroll/my", {
      params,
    });

    return {
      status: true,
      res: res?.data ?? [],
    };
  } catch (error) {
    const mes =
      error?.response?.data?.message ||
      "Something went wrong";

    errorMsgApi(mes);

    return {
      status: false,
      error: mes,
    };
  }
};