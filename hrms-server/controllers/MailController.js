import Mail from "../models/MailModal.js";
import Company from "../models/CompanyModal.js";
import { sendMail } from "../lib/attendanceUtils.js";
import { success, failure } from "../lib/response.js";

export const replacePlaceholders=(template,values={})=>Object.entries(values).reduce((text,[key,value])=>text.replace(new RegExp(`\\[${key}\\]`,"g"),String(value??"")),template);
export const createMailTemp=async(req,res)=>{const {companyId,templateName,subject,body}=req.body;if(!companyId||!templateName||!subject||!body)return failure(res,400,"companyId, templateName, subject and body are required");const company=await Company.findOne({_id:companyId,hrId:req.user._id});if(!company)return failure(res,403,"Company not found");const t=await Mail.findOneAndUpdate({companyId,templateName},{subject,body},{new:true,upsert:true,runValidators:true});return success(res,{message:"Mail template saved",data:t});};
export const sendNewEmpWelComeMail=async({to,placeholders={},company,templateName="welcome",attachment})=>{if(!company)return null;const t=await Mail.findOne({companyId:company._id,templateName});if(!t)return null;return sendMail(to,replacePlaceholders(t.subject,placeholders),replacePlaceholders(t.body,placeholders),attachment?[attachment]:[]);};
export const getWelcomeMail=async(req,res)=>{const t=await Mail.findOne({companyId:req.params.id,templateName:req.params.templateName});if(!t)return failure(res,404,"Mail template not found");return success(res,{data:t});};
export const updateWelcomeMail=async(req,res)=>{const t=await Mail.findOneAndUpdate({companyId:req.params.id,templateName:req.params.templateName},{subject:req.body.subject,body:req.body.body},{new:true,upsert:true,runValidators:true});return success(res,{message:"Mail template updated",data:t});};
