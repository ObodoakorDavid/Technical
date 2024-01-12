const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const TokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

TokenSchema.methods.generateEmailToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

TokenSchema.methods.comapareTokens = async function (incomingEmailToken) {
  const isMatch = await bcrypt.compare(incomingEmailToken, this.token);
  return isMatch;
};

module.exports = mongoose.model("Token", TokenSchema);
