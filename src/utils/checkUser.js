const User = require("../models/user");

const checkUser = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next();
  }
  const user = await User.findOne({ email });

  if (!user) {
    return next();
  }
  req.registered = true;
  next();
};

module.exports = checkUser;
