const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    guildId: String,
    userId: String,
    roles: Array,
    from: String,
    until: String,
    reason: String,
    responsible: String,
});
module.exports = mongoose.model("muted", Schema);
