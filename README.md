# Chimera - Open Source Discord Bot

Chimera is an open-source, multifunctional Discord bot built with [discord.js](https://discord.js.org/) to enhance Discord servers with security, moderation, utility, and entertainment features. **Note:** This project is incomplete, with some features poorly implemented or non-functional. We welcome contributions to help improve and complete the bot!

## Status
Chimera is a work-in-progress. Many features listed below are either partially implemented, poorly coded, or not working as intended. The codebase is shared to encourage community contributions to fix bugs, improve existing features, and add new ones.

## Features

### Security (Partially Implemented)
- **Bots Protection:** Aims to protect against malicious bots, but current implementation is incomplete and may not detect all threats.
- **Verification:** Basic verification system for new members, but lacks robust configuration and reliability.
- **Anti-Links Spam and Fraud:** Intended to block spammy links and fraudulent content, but filtering logic is rudimentary and prone to errors.

### Moderation (Partially Functional)
- **Effortless Management:** Basic moderation commands (e.g., ban, kick) exist but may have bugs or lack advanced functionality.
- **Customizable Controls:** Limited customization options; some settings may not persist or work as expected.

### Utility (Incomplete)
- **Temporary Voice Channels:** Code for creating temporary voice channels exists but is unstable and lacks proper cleanup.
- **Selfroles:** Self-role assignment is partially implemented but may fail under certain conditions.
- **Easy Setup:** Setup process is intended to be simple but currently lacks clear documentation and may require manual configuration.

### Dashboard (Not Implemented)
- A web dashboard for bot management is planned but not yet started. Contributions to kickstart this feature are highly welcome!

### Entertainment (Non-Functional)
- **Minigames:** Planned feature for minigames, but no working implementations are included.
- **Memes and More:** Meme-related features are conceptualized but not coded.

### Reliability
- **Work in Progress:** The bot is not yet reliable, with frequent bugs and incomplete features. Continuous community contributions are needed to improve stability and security.

## Getting Started
1. Clone the repository: `git clone https://github.com/JamesCicada/chimera.git`
2. Install dependencies: `npm install`
3. Configure environment variables (e.g., bot token) in a `.env` file. See `.env.example` for guidance.
4. Run the bot: `node index.js`
5. Invite the bot to your server using the [Discord Developer Portal](https://discord.com/developers/applications).
6. Note: Due to incomplete features, expect issues during setup and operation.

## Support
For questions, bug reports, or feedback, join our [support server](https://discord.gg/gNyTSB2j3N) or open an issue on the [GitHub repository](#). Please be patient, as the project is community-driven and actively being improved.

## Contributing
We welcome contributions to make Chimera better! Before contributing, please read the following guidelines:

### Contribution Guidelines
- **Fork and Pull Request:** Fork the repository, make changes in a new branch, and submit a pull request for review.
- **Code Quality:** Follow the existing code style and use ESLint for linting. Run `npm run lint` before submitting.
- **Issue Tracking:** Check the issue tracker for known bugs or feature requests. Create a new issue if your contribution addresses a new problem.
- **Focus Areas:** Prioritize fixing broken features (e.g., verification, anti-spam) or completing incomplete ones (e.g., temporary voice channels, dashboard).
- **Testing:** Test your changes thoroughly. Include details of your testing in the pull request description.
- **Communication:** Join our [support server](https://discord.gg/gNyTSB2j3N) to discuss ideas or get feedback before starting major changes.
- **Respect the License:** All contributions must comply with the project's [MIT License](LICENSE).

### How to Contribute
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-or-bugfix-name`
3. Make your changes and commit: `git commit -m "Description of changes"`
4. Push to your fork: `git push origin feature-or-bugfix-name`
5. Open a pull request with a clear description of your changes and reference any related issues.

## License
Chimera is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as permitted by the license.

Thank you for helping improve Chimera!