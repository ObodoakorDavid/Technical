require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const authRouter = require("./src/routes/authRouter");
const connectDB = require("./src/config/connectDB.JS");
const notFound = require("./src/middlewares/notFound");
const errorMiddleware = require("./src/middlewares/error");
const rateLimit = require("express-rate-limit");
const checkUser = require("./src/utils/checkUser");

const User = require("./src/models/user");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.url === "/password_reset",
  message: async (req, res) => {
    return "Too Many Request";
  },
  handler: async (req, res, next, options) => {
    console.log(options);
    console.log(req.rateLimit);
    const { email } = req.body;
    if (!email) {
      return res.status(429).json({ msg: "Too many request" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(429).json({ msg: "Too many request" });
    }

    console.log(user);

    if (!user.isSuspended) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { suspendendAt: Date.now(), isSuspended: true }
      );
    }

    let now = new Date();
    now.setMinutes(now.getMinutes() - 30 / 10);
    let minutesLeft = Math.round((user.suspendendAt - now) / 1000 / 60);
    console.log(minutesLeft);
    if (minutesLeft <= 0) {
      await User.findOneAndUpdate({ _id: user._id }, { isSuspended: false });
      return next();
    }
    return res.status(429).json({
      msg: `You have been limited for ${minutesLeft}minutes`,
    });
  },
});

app.use(express.json());
app.use("/api/v1/auth", checkUser, limiter, authRouter);
app.use(notFound);
app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("connected!");
    app.listen(port, () => `running`);
  } catch (error) {
    console.log(error);
  }
};

start();
