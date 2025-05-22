module.exports = {
    client: {
        token: "Your Bot token (USE .env FOR SAFETY)",
        id: "Your Bot ID (USE .env FOR SAFETY)",
    },
    handler: {
        prefix: "&",
        deploy: true,
        commands: {
            prefix: true,
            slash: true,
            user: true,
            message: true,
        },
        mongodb: {
            enabled: true,
            uri: "Your MongoDB URI string (USE .env FOR SAFETY)"
        },
    },
    users: {
        developers: ["370995733509177355"],
    },
    development: { 
        enabled: false,
        guild: "Enter your guild ID here or you can use .env",
    }, 
    messageSettings: {
        nsfwMessage: "NSFW commands are restricted to NSFW channels.",
        developerMessage: "Unauthorized access. You do not have the privilege to use this command.",
        cooldownMessage: "Hold on! You're moving too quickly to execute this command.",
        globalCooldownMessage: "Hold on! This command is on a global cooldown.",
        notHasPermissionMessage: "Insufficient permissions to use this command.",
        notHasPermissionComponent: "Insufficient permissions to use this component.",
        missingDevIDsMessage: "This command is reserved for developers only."
    }
};
