const EmailToken = require("../models/emailToken");
const User = require("../models/user");

const sendEmail = require("../utils/sendEmail");

const signupUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({
      msg: "Please provide all fields",
    });
  }

  const mailOptions = {
    from: "Testing@gmail.com",
    to: email,
    subject: "Registeration Successfull",
    text: `Click this link to continue ${`http://localhost:3000/api/v1/auth/login`}`,
  };

  try {
    const user = await User.create({ ...req.body });
    const token = await user.createJWT();
    const emailTokenUser = await EmailToken.create({ email });
    const emailToken = await emailTokenUser.generateEmailToken();

    mailOptions.text = `Click this link to continue http://localhost:3000/api/v1/auth/activate/${emailToken}`;

    const info = await sendEmail(mailOptions);

    res.status(200).json({
      user: { username: user.username },
      token,
      message: `Email has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const activateEmail = async (req, res) => {
  const { token } = req.params;
  console.log(token);
  const isRegistered = await EmailToken.findOne({ token });
  if (!isRegistered) {
    return res.status(401).json({ msg: "User is not registered" });
  }

  const user = await User.findOneAndUpdate(
    { email: isRegistered.email },
    { emailActivated: true }
  );
  res.status(200).json({
    msg: "Email Activated",
  });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please provide all fields" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ msg: "No user with this email" });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const token = user.createJWT();

  res.status(200).json({ id: user._id, token });
};

const passwordReset = async (req, res) => {
  return res.status(200).json({ msg: "Testing" });
};

module.exports = { signupUser, loginUser, passwordReset, activateEmail };
