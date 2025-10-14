import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // sẽ mã hoá bằng bcrypt
});

export default mongoose.model("User", userSchema);
