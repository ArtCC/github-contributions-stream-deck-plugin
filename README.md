# GitHub Contributions Stream Deck Plugin

## Overview

This Stream Deck plugin allows you to visualize your GitHub contribution graph directly on your Stream Deck. Keep track of your coding activity with a quick glance at your Stream Deck!

## Features

- **Real-time GitHub Contributions**: Display your GitHub contributions graph updated in real-time.
- **Multiple Time Frames**: View your contributions for the day, week, month, or actual year.
- **Extended Year View**: Utilize 5 buttons to display a detailed, full-year contribution graph.
- **Theme Support**: Choose between light and dark themes to match your preference or setup.
- **Customizable**: Enter your GitHub username and personal access token for secure, personalized data retrieval.
- **Auto-refresh**: Automatically updates every 30 minutes to keep your data current.

## Installation

1. Download the latest release from the [releases page](https://marketplace.elgato.com/stream-deck).
2. Double-click the downloaded file to install it on your Stream Deck.

You can install the plugin locally by downloading the code but if you want to help me in developing more software independently you can purchase the plugin officially from the Elgato Stream Deck market. Thank you very much!

## Configuration

1. Drag the GitHub Contributions action onto your Stream Deck.
2. Click on the action to open the Property Inspector.
3. Enter your GitHub username.
4. [Create a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) on GitHub with the proper permissions (read) and enter it in the token field.
5. Choose your preferred time frame (day, week, month, year, or year with 5 buttons horizontally).
6. If using the 5-button year view, configure each button with its corresponding number (1-5).
7. Select your preferred theme (light or dark).
8. Click 'Save Settings'.

## Usage

Once configured, the plugin will display your GitHub contributions graph on the Stream Deck button(s). The graph updates automatically every 30 minutes, or you can press the button to refresh manually.

### 5-Button Year View
To use the extended year view:
1. Set up 5 adjacent buttons on your Stream Deck.
2. Configure each button with the same settings, but assign each a unique button number (1-5).
3. This will create a large, detailed view of your entire year's contributions spread across 5 buttons.

## Privacy and Security

This plugin uses your personal access token to retrieve your public contribution data from GitHub. Your token is stored locally on your machine and is never sent to any server other than GitHub's API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Acknowledgements

- Thanks to the Elgato Stream Deck SDK for making this plugin possible.
- GitHub for providing the API to retrieve contribution data.

## Support

If you encounter any problems or have any questions, please open an issue on this GitHub repository.

---

Enjoy keeping track of your GitHub contributions right from your Stream Deck!

Arturo Carretero Calvo - 2024