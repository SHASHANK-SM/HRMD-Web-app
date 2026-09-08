import Timesheet from "../models/timesheetModal.js";
import Attendance from "../models/attendanceModal.js";
import Leave from "../models/leaveModal.js";
import Payslip from "../models/payslipmodal.js";
import EmployeeTodo from "../models/EmployeTask.modal.js";
import Notification from "../models/NotificationModal.js";
import { success, failure } from "../lib/response.js";

export const addTimeSheet=async(req,res)=>{if(!Array.isArray(req.body))return failure(res,400,"Body must be an array");const ops=req.body.map(e=>({updateOne:{filter:{user:req.user._id,date:e.date},update:{$set:{workHours:Number(e.workHours||0),breakHours:Number(e.breakHours||0),overTime:Number(e.overTime||0),timeOff:Number(e.timeOff||0),day:e.day,week:e.week,month:Number(e.month||new Date().getMonth()+1),year:Number(e.year||new Date().getFullYear()),hrId:req.user.head}},upsert:true}}));const result=await Timesheet.bulkWrite(ops);return success(res,{message:"Timesheet updated successfully",data:result});};
export const getTimeSheet=async(req,res)=>success(res,{data:await Timesheet.find({week:req.params.week,user:req.user._id}).sort({date:1})});
export const getAttendance=async(req,res)=>{const {startDate,endDate}=req.query;if(!startDate||!endDate)return failure(res,400,"startDate and endDate are required");const data=await Attendance.find({user:req.user._id,date:{$gte:startDate,$lte:endDate}}).sort({date:-1});return success(res,{data});};
export const getPaySlipsForEmpoyee=async(req,res)=>success(res,{data:await Payslip.find({empId:req.user._id}).sort({year:-1,createdAt:-1})});
export const leavesAdded=async(req,res)=>{const {leaveType,startDate,endDate,reason}=req.body;if(!leaveType||!startDate||!endDate||!reason)return failure(res,400,"leaveType, startDate, endDate and reason are required");if(startDate>endDate)return failure(res,400,"Invalid leave dates");const days=Math.floor((new Date(`${endDate}T00:00:00`)-new Date(`${startDate}T00:00:00`))/86400000)+1;const overlap=await Leave.findOne({user:req.user._id,status:{ $in:["Pending","Approved"]},startDate:{$lte:endDate},endDate:{$gte:startDate}});if(overlap)return failure(res,409,"Leave dates overlap an existing request");const leave=await Leave.create({leaveType,startDate,endDate,numberOfDays:days,reason,document:req.file?.path||null,user:req.user._id,hrId:req.user.head});if(req.user.head)await Notification.create({recipient:req.user.head,type:"new-leave-request",title:"New leave request",message:`${req.user.name} submitted a leave request`,data:{leaveId:leave._id}});return success(res,{status:201,message:"Leave created successfully",data:leave});};
export const getleaves=async(req,res)=>{const data=await Leave.find({user:req.user._id}).sort({startDate:-1});const approved=data.filter(x=>x.status==="Approved").reduce((s,x)=>s+x.numberOfDays,0);return success(res,{data,meta:{approvedDays:approved}});};
export const getTods=async(req,res)=>success(res,{data:await EmployeeTodo.find({assignee:req.user._id}).sort({dueDate:1})});
