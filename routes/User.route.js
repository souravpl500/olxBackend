const express = require("express");
const { UserModel } = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate.middleware");

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  try {
    const user = await UserModel.find();
    res.status(200).send(user);
  } catch (err) {
    console.log({ err: err });
    res.send({ err: err });
  }
});

userRouter.get("/getProfile/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById({ _id: id });
    res.status(200).json({
      success: true,
      User : user,
    });
  } catch (err) {
    console.log({ err: err });
    res.send({ success: false, err: err });
  }
});

userRouter.post("/register", async (req, res) => {
  const { image, name, bio, phone, email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).send({ message: "Email already registered" });
    } else {
      bcrypt.hash(password, 5, async (err, secure_password) => {
        if (err) {
          console.log(err);
          return res.send(err);
        } else {
          const user = new UserModel({
            image,
            name,
            bio,
            phone,
            email,
            password: secure_password,
          });
          await user.save();
          res.status(201).send("Registered successfully");
        }
      });
    }
  } catch (err) {
    res.status(500).send("Error in registering the user");
    console.log(err);
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    const hashed_password = user[0].password;
    if (user.length > 0) {
      bcrypt.compare(password, hashed_password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            { userID: user[0]._id },
            process.env.SecretKey
          );
          res.status(200).send({ msg: "Login Successful", token: token, user: user });
        } else {
          res.status(400).send("Wrong Credential");
        }
      });
    } else {
      return res.status(400).send("Email not found!");
    }
  } catch (err) {
    res.status(500).send("Something went wrong");
    console.log(err);
  }
});

userRouter.patch("/:id", async (req, res) => {
  const payload = req.body;
  const id = req.params.id;
  try {
    const user = await UserModel.findByIdAndUpdate({ _id: id }, payload);
    res.status(204).send({
      success: true,
      msg: "Successfully Updated the user",
      users: user,
    });
    await user.save();
  } catch (err) {
    console.log({ err: err, msg: " User Update Error!" });
    res.send({ success: false, msg: " User Update Error!", err: err });
  }
});

module.exports = {
  userRouter,
};
