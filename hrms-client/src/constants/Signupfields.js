export const signUpFields = [
  {
    label: "Employee Id *",
    name: "empId",
    type: "password",
    readOnly: true,
  },

  {
    label: "Email Id *",
    name: "email",
    type: "email",
    readOnly: true,
  },
  {
    label: "Designation *",
    name: "designation",
    type: "text",
    readOnly: true,
  },
  {
    label: "First Name *",
    name: "firstName",
    type: "text",
    validation: {
      required: "First Name is required",
      minLength: {
        value: 3,
        message: "First name must be at least 3 characters",
      },
    },
  },
  {
    label: "Last Name *",
    name: "lastName",
    type: "text",
    validation: {
      required: "Last Name is required",
      minLength: {
        value: 3,
        message: "Last name must be at least 3 characters",
      },
    },
  },

  {
    label: "Password *",
    name: "password",
    type: "password",
    validation: {
      required: "Password is required",
      minLength: {
        value: 5,
        message: "Password must be at least 5 characters",
      },
    },
  },
  {
    label: "Confirm Password *",
    name: "confirmPassword",
    type: "text",
    validation: {
      required: "Confirm Password is required",
      minLength: {
        value: 5,
        message: "Password must be at least 5 characters",
      },
    },
  },
];
