const passwordReset = async (req, res) => {
    return res.status(200).json({ msg: "Testing" });
  };
  
  module.exports = { signupUser, loginUser, passwordReset, activateEmail };