import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        length: 3,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        length: 6,
        required: true
    },
    profileImage: {
        type: String,
        default: ""
    }
}
,{
    timestamps: true
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;