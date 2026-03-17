import { Router } from "express";
import {
	addRecordingMeta,
	addToActivity,
	getConfusionInsightByMeetingCode,
	getGroupedDoubtsByMeetingCode,
	getRecordingsByMeetingCode,
	getAllActivity,
	login,
	register,
	validateMeetingRoom,
} from "../controllers/user.controller.js";


const router = Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activity").post(addToActivity)
router.route("/get_all_activity").get(getAllActivity)
router.route("/validate_room").get(validateMeetingRoom)
router.route("/add_recording").post(addRecordingMeta)
router.route("/get_recordings").get(getRecordingsByMeetingCode)
router.route("/get_grouped_doubts").get(getGroupedDoubtsByMeetingCode)
router.route("/get_confusion_insight").get(getConfusionInsightByMeetingCode)

export default router;