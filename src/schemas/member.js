const mongoose = require("mongoose");
const cooldownSchema = new mongoose.Schema({
    creatorId: String,
    endsAt: String,
    warned: Boolean
})
const warningSchema = new mongoose.Schema({
    reason: String,
    warningId: String,
    moderatorId: String,
    active: Boolean
}, {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  })
const tempRoleSchema = new mongoose.Schema({
    roleId: String,
    moderatorId: String,
    endsAt: String
})
const Schema = new mongoose.Schema({
    memberId: String,
    guildId: String,
    invites: Array,
    invitedBy: String,
    tempCooldown: [cooldownSchema],
    warnings: [warningSchema],
    tempRoles: [tempRoleSchema]
});
module.exports = mongoose.model("member", Schema);
