const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    userId: String,
    language: String,
    birthdate: String,
});
module.exports = mongoose.model("usersm", Schema);
