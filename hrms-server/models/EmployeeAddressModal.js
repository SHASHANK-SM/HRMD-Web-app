import mongoose from "mongoose";
const schema = new mongoose.Schema({ primaryAddress: String, country: String, state: String, city: String, pincode: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true } }, { timestamps: true });
export default mongoose.model("employeeaddress", schema);
