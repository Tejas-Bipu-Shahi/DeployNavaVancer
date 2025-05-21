import express from "express"
import noticeController from "../../../controllers/admin/notice_controller.js"
import tokenVerify from "../../../tokens/token_verify.js"

const admin_notice_route = express.Router()

admin_notice_route.post("/create-notice", tokenVerify, noticeController)

admin_notice_route.delete("/delete/notice/:id", tokenVerify, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const deleted = await (await import("../../../database/mongoose_schema/notice_schema.js")).default.findByIdAndDelete(noticeId);
    if (!deleted) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default admin_notice_route