import Complaint from '../models/user.complaintmodel.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import contactEmail from '../nodemailersetup.js';
export const addComplaint=async(req,res)=>{
    const {uuid,complaint,complaint_proof,issue_category}=req.body;
    try{
    let mycomplaint=Complaint()
    let user=await User.findOne({uuid})
    let non_hashed_complaint_id=uuid+uuidv4()
    const saltrounds=10;
    //first generate salt
    let salt=await bcrypt.genSalt(saltrounds);
    let complaint_id=await bcrypt.hash(non_hashed_complaint_id,salt);
    user.previous_complaints.push(non_hashed_complaint_id);
    await user.save();
   // mycomplaint.uuid=uuid;
    mycomplaint.complaint=complaint;
    mycomplaint.complaint_proof=complaint_proof;
    mycomplaint.issue_category=issue_category;
    mycomplaint.complaint_id=complaint_id;
    await mycomplaint.save();
    //send the email now
    const mail = {
        from: "ComplaintBox",
        to: "msanjay1907@gmail.com",
        subject: `Complaint Reagarding ${issue_category}`,
        html: `
            <p>Complaint: ${complaint}</p>
            <p>Proof:${complaint_proof}</p>
            `,
    };
  await contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json(error);
    } else {
    res.status(201).json({"message":non_hashed_complaint_id})
    }
  });
    
    }catch(e){
        console.log(e);
        res.status(400).json({"message":"something went wrong"})
    }
}
export const getMyComplaints= async(req,res)=>{
    const {uuid}=req.body;
    let user=await User.findOne({uuid})
    let complaints=user.previous_complaints;
    let newlist=[]
    let complaint=await Complaint.find({});
    console.log(complaint,complaints);
    for(let i =0;i<complaints.length;i++){
        for(let j=0;j<complaint.length;j++){
            let result=await bcrypt.compare(complaints[i],complaint[j].complaint_id);
            
            if(result){
                newlist.push(complaint[j]);
            }
        }
    }
    console.log(newlist)
    res.status(201).json({"the complaint list of a user":newlist})
}