const mongoose = require("mongoose");
const pollSchema = new mongoose.Schema({ id: String, choice1: Array, choice2: Array, choice3: Array, choice4: Array });
const Schema = new mongoose.Schema({
    guildId: String,
    protection:{
        status: Boolean,
        logs: String
    }
});
module.exports = mongoose.model("protection", Schema);
