// we will create the tempy functions for getOwner, getRejected, getData
const tempData = require('../schemas/tempvc');
async function getOwner(creatorId ,chId, guildId) {
    const tData = await tempData.findOne({ guildId: guildId, creatorsId: creatorId });
    if (!tData) return null
    const temp = tData.temps.find(temp => temp.vcId === chId)
    if (!temp) return null
    return temp.ownerId
}
async function getRejected(creatorId ,chId, guildId) {
    const tData = await tempData.findOne({ guildId: guildId, creatorsId: creatorId });
    if (!tData) return null
    const temp = tData.temps.find(temp => temp.vcId === chId)
    if (!temp) return null
    return temp.rejected
}
async function getData(creatorId ,chId, guildId) {
    const tData = await tempData.findOne({ guildId: guildId, creatorsId: creatorId });
    if (!tData) return null
    const temp = tData.temps.find(temp => temp.vcId === chId)
    if (!temp) return null
    return temp
}



module.exports = { getOwner, getRejected, getData }