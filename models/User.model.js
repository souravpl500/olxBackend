const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  image: String,
  name: String,
  bio: String,
  phone: Number,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = {
  UserModel,
};
