import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
    const token = req.headers("Authorization").replace("Bearer", "");
    
    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password");
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized" });
    }
    };


    export default protectRoute;