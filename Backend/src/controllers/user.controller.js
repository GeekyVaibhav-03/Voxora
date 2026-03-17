import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import { Recording } from "../models/recording.model.js";
import { Doubt } from "../models/doubt.model.js";
import { buildConfusionInsight } from "../services/ai.service.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto"

const login = async (req,res) => {
    const {username,password} = req.body;
    if(!username || !password) {
        return res.status(400).json({message : "Please Provide"})
    }
    try{
        const user = await User.findOne({username})
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message : "User not found"});
        }
      const isPasswordValid = await bcrypt.compare(password,user.password);
      if(isPasswordValid){
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ message: token, token })
        }
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }catch(e) {
        return res.status(500).json({message : `Something went wrong ${e}`})
    }
}

const register = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "user already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashPassword,
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User registered" });
  } catch (e) {
    res.json({message : `Something wenent wront ${e}`})
  }
};

const addToActivity = async (req, res) => {
  const token = req.body?.token;
  const meetingCode = req.body?.meeting_code;

  if (!token || !meetingCode) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "token and meeting_code are required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    const meeting = new Meeting({
      user_id: user._id.toString(),
      meetingCode,
    });

    await meeting.save();

    return res.status(httpStatus.CREATED).json({ message: "Activity added" });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` });
  }
};

const getAllActivity = async (req, res) => {
  const token = req.query?.token;

  if (!token) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "token is required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    const meetings = await Meeting.find({ user_id: user._id.toString() }).sort({ date: -1 });

    return res.status(httpStatus.OK).json(meetings);
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` });
  }
};

const validateMeetingRoom = async (req, res) => {
  const token = req.query?.token;
  const meetingCode = req.query?.meeting_code;

  if (!token || !meetingCode) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "token and meeting_code are required",
      exists: false,
    });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token", exists: false });
    }

    const escapedMeetingCode = meetingCode
      .toString()
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const meetingExists = await Meeting.exists({
      meetingCode: { $regex: new RegExp(`^${escapedMeetingCode}$`, "i") },
    });

    if (!meetingExists) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Meeting room not found",
        exists: false,
      });
    }

    return res.status(httpStatus.OK).json({ exists: true });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`,
      exists: false,
    });
  }
};

const addRecordingMeta = async (req, res) => {
  const token = req.body?.token;
  const meetingCode = req.body?.meeting_code;
  const durationSec = Number(req.body?.duration_sec || 0);
  const sizeBytes = Number(req.body?.size_bytes || 0);
  const fileName = req.body?.file_name || "";

  if (!token || !meetingCode) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "token and meeting_code are required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    const recording = await Recording.create({
      meetingCode: meetingCode.toString().toLowerCase(),
      teacherUsername: user.username,
      durationSec,
      sizeBytes,
      fileName,
    });

    return res.status(httpStatus.CREATED).json({
      message: "Recording metadata saved",
      recording,
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`,
    });
  }
};

const getRecordingsByMeetingCode = async (req, res) => {
  const token = req.query?.token;
  const meetingCode = req.query?.meeting_code;

  if (!token || !meetingCode) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "token and meeting_code are required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    const recordings = await Recording.find({
      meetingCode: meetingCode.toString().toLowerCase(),
    }).sort({ createdAt: -1 });

    return res.status(httpStatus.OK).json(recordings);
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`,
    });
  }
};

const getGroupedDoubtsByMeetingCode = async (req, res) => {
  const token = req.query?.token;
  const meetingCode = req.query?.meeting_code;

  if (!token || !meetingCode) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "token and meeting_code are required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    const doubts = await Doubt.find({
      meetingCode: meetingCode.toString().toLowerCase(),
    }).sort({ count: -1, updatedAt: -1 });

    return res.status(httpStatus.OK).json(doubts);
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`,
    });
  }
};

const getConfusionInsightByMeetingCode = async (req, res) => {
  const token = req.query?.token;
  const heatmap = req.body?.heatmap || req.query?.heatmap;

  if (!token) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "token is required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    const parsedHeatmap =
      typeof heatmap === "string"
        ? JSON.parse(heatmap || "{}")
        : heatmap || {};

    const insight = await buildConfusionInsight(parsedHeatmap);

    return res.status(httpStatus.OK).json({ insight });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong ${e}`,
    });
  }
};

export {
  login,
  register,
  addToActivity,
  getAllActivity,
  validateMeetingRoom,
  addRecordingMeta,
  getRecordingsByMeetingCode,
  getGroupedDoubtsByMeetingCode,
  getConfusionInsightByMeetingCode,
}