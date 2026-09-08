import { errorMsgApi } from "../../../Core/toasts";
import { API } from "../../../Core/url";

export const getPayrollEveryMonth = async ({
  month,
  page,
  limit = 10,
  search,
}) => {
  try {
    const params = {};

    if (month) params.month = month;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (search) params.search = search;

    const res = await API.get("/payroll", {
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