import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import Input from "../../../Utils/Input";
import Button from "../../../Utils/Button";
import { addNewEmployeeApi } from "../Services/hr-employees-management";
import { fetchEmployees } from "../Slices/HrEmployeeSlice";
import { useDispatch } from "react-redux";

const HrAddNewEmpForm = ({ handleOpenDrawerForNewEmp }) => {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      jobTimeline: [
        {
          effectiveDate: data?.dob
            ? data?.dob?.toISOString().split("T")[0]
            : null,
          jobTitle: data?.jobTitle,
          positionType: data?.department,
          seatNo: data?.seatNumber,
          location: "",
          employmentType: "",
          shiftTimmings: {
            startTime: "",
            endTime: "",
          },
        },
      ],
    };

    const resData = await addNewEmployeeApi({ apiData: formattedData, token });

    if (resData.status) {
      handleOpenDrawerForNewEmp();
      dispatch(
        fetchEmployees({
          page: 1,
          search: "",
          department: "",
          status: "",
          token,
        })
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full"
    >
      <h2 className="text-xl font-semibold">Add New Employee</h2>

      <Input
        label="Full Name"
        name="name"
        register={register}
        errors={errors}
        validation={{ required: "Name is required" }}
      />
      <Input
        label="Employee ID"
        name="empId"
        register={register}
        errors={errors}
        validation={{ required: "Employee ID is required" }}
      />

      <Input
        label="Job Role"
        name="jobTitle"
        register={register}
        errors={errors}
        validation={{ required: "Job Role is required" }}
      />
      <Input
        label="Position Type"
        name="department"
        register={register}
        errors={errors}
        validation={{ required: "Position Type is required" }}
      />

      <Input
        label="Email Address"
        name="email"
        register={register}
        errors={errors}
        validation={{
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Invalid email",
          },
        }}
      />
      <Input
        label="Contact Number"
        name="mobile"
        register={register}
        errors={errors}
        validation={{ required: "Contact Number is required" }}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Join Date
        </label>
        <Controller
          control={control}
          name="dob"
          rules={{ required: "Join Date is required" }}
          render={({ field }) => (
            <DatePicker
              {...field}
              selected={field.value}
              onChange={(val) => field.onChange(val)}
              dateFormat="yyyy-MM-dd"
              className="w-[370px] border px-3 py-2 rounded-md"
              placeholderText="Select Join Date"
              // minDate={new Date()}
            />
          )}
        />
        {errors.dob && (
          <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
        )}
      </div>

      <Input
        label="Seat Number"
        name="seatNumber"
        register={register}
        errors={errors}
        validation={{ required: "Seat Number is required" }}
      />

      <div className="w-full flex justify-end gap-4 mt-4">
        <Button bgColor="bg-[#f5f5f5]" textColor="text-black">
          Cancel
        </Button>
        <Button
          bgColor="bg-black"
          textColor="text-white"
          type="submit"
          loading={isSubmitting}
        >
          Add Employee
        </Button>
      </div>
    </form>
  );
};

export default HrAddNewEmpForm;
