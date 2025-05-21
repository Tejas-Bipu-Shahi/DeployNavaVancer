import notice_model from "../../database/mongoose_schema/notice_schema.js";
import adminSchema_model from "../../database/mongoose_schema/admin_schema.js";
import teachersSchema_model from "../../database/mongoose_schema/teachers_schema.js";

const noticeController = async (req, res) => {
  try {
    // Create notice without attachments
    const result = await notice_model.create({
      adminID: req.user.id,
      noticecategory: req.body.noticecategory,
      targetaudience: req.body.targetaudience,
      noticetitle: req.body.noticetitle,
      noticedes: req.body.noticedes,
    });
    
    console.log("Created notice:", result);
    
    res.json({ 
      alertMsg: "Posted Notice Successfully", 
      dateOF: result.date
    });
  } catch (error) {
    console.error("Error in notice controller:", error);
    res.status(404).send(error.message);
  }
};

export default noticeController;
