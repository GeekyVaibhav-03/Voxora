import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1/users";

const client = axios.create({
    baseURL: apiBaseUrl,
});

const getAuthToken = () => localStorage.getItem("token");
const getStoredRole = () => localStorage.getItem("role") || "";

export const AuthProvider = ({ children }) => {
    const router = useNavigate();
    const [userData, setUserData] = useState({
        username: localStorage.getItem("username") || "",
        role: getStoredRole(),
    });

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", {
                name,
                username,
                password,
            });

            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }

            return "Registration completed";
        } catch (error) {
            throw error;
        }
    };

    const handleLogin = async (
        username,
        password,
        redirectTo = "/student",
        role = "student"
    ) => {
        try {
            const request = await client.post("/login", {
                username,
                password,
            });

            if (request.status === httpStatus.OK) {
                const token = request.data?.token ?? request.data?.message;

                if (token) {
                    const resolvedRole =
                        role || (redirectTo === "/teacher" ? "teacher" : "student");
                    localStorage.setItem("token", token);
                    localStorage.setItem("username", username);
                    localStorage.setItem("role", resolvedRole);

                    if (resolvedRole === "student") {
                        sessionStorage.removeItem("teacher-room-access");
                    } else {
                        sessionStorage.removeItem("student-room-access");
                    }

                    setUserData({ username, role: resolvedRole });
                    router(redirectTo);
                }
            }

            return request.data;
        } catch (error) {
            throw error;
        }
    };

    const getHistoryOfUser = async () => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Login required");
        }

        try {
            const request = await client.get("/get_all_activity", {
                params: { token },
            });
            return request.data;
        } catch (error) {
            throw error;
        }
    };

    const addToUserHistory = async (meetingCode) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Login required");
        }

        try {
            const request = await client.post("/add_to_activity", {
                token,
                meeting_code: meetingCode,
            });
            return request.data;
        } catch (error) {
            throw error;
        }
    };

    const validateMeetingRoom = async (meetingCode) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Login required");
        }

        try {
            const request = await client.get("/validate_room", {
                params: {
                    token,
                    meeting_code: meetingCode,
                },
            });

            return request.data?.exists === true;
        } catch (error) {
            throw error;
        }
    };

    const addRecordingMeta = async ({ meetingCode, durationSec, sizeBytes, fileName }) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Login required");
        }

        try {
            const request = await client.post("/add_recording", {
                token,
                meeting_code: meetingCode,
                duration_sec: durationSec,
                size_bytes: sizeBytes,
                file_name: fileName,
            });

            return request.data;
        } catch (error) {
            throw error;
        }
    };

    const getRecordingsByMeetingCode = async (meetingCode) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Login required");
        }

        try {
            const request = await client.get("/get_recordings", {
                params: {
                    token,
                    meeting_code: meetingCode,
                },
            });

            return request.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        sessionStorage.removeItem("student-room-access");
        sessionStorage.removeItem("teacher-room-access");
        setUserData({ username: "", role: "" });
        router("/");
    };

    const data = {
        userData,
        setUserData,
        addToUserHistory,
        validateMeetingRoom,
        addRecordingMeta,
        getRecordingsByMeetingCode,
        getHistoryOfUser,
        handleRegister,
        handleLogin,
        logout,
        userRole: userData.role,
        isAuthenticated: Boolean(getAuthToken()),
    };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};