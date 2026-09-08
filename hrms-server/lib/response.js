export const success = (res, { status = 200, message = "Success", data = null, meta } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

export const failure = (res, status, message, errors = undefined) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
