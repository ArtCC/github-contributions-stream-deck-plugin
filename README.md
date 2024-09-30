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

### Option 1: Purchase the compiled plugin

For a hassle-free installation and to support the development of this plugin, you can purchase the compiled version for just €2.

<a href="https://ko-fi.com/s/117a6b9e39" target="_blank">
  <img src="https://github.com/ArtCC/github-contributions-stream-deck-plugin/blob/main/resources/support-me-ko-fi.png" alt="Support me on ko-fi.com" >
</a>

Once purchased, follow the installation instructions provided with the download.

### Option 2: Install from source

As this plugin is not yet available on the Elgato Stream Deck Marketplace, you can install it locally by following these steps:

### For macOS:

1. Download the source code from this GitHub repository.
2. Unzip the downloaded file if necessary.
3. Open Finder and go to the following directory:
   ```
   ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
   ```
4. Copy the entire folder named `com.artcc.github-contributions-stream-deck-plugin.sdPlugin` from the unzipped download into this Plugins directory.
5. Restart the Stream Deck application.

### For Windows:

1. Download the source code from this GitHub repository.
2. Unzip the downloaded file if necessary.
3. Open File Explorer and go to the following directory:
   ```
   %appdata%\Elgato\StreamDeck\Plugins\
   ```
4. Copy the entire folder named `com.artcc.github-contributions-stream-deck-plugin.sdPlugin` from the unzipped download into this Plugins directory.
5. Restart the Stream Deck application.

After installation, the GitHub Contributions plugin should appear in your Stream Deck application.

## Configuration

1. Drag the GitHub Contributions action onto your Stream Deck.
2. Click on the action to open the Property Inspector.
3. Enter your GitHub username.
4. [Create a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) on GitHub with the proper permissions (read:user) and enter it in the token field.
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

## Screenshots

Here are some screenshots demonstrating the plugin in action:

![Settings](https://github.com/ArtCC/github-contributions-stream-deck-plugin/blob/main/resources/settings.jpeg)

![Dark theme](https://github.com/ArtCC/github-contributions-stream-deck-plugin/blob/main/resources/dark.jpeg)

![Light theme](https://github.com/ArtCC/github-contributions-stream-deck-plugin/blob/main/resources/light.jpeg)

## Privacy and Security

Your personal access token is stored locally on your machine and is never sent to any server other than GitHub's API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support the Project

If you find this plugin useful and would like to support its development, consider making a donation or purchasing the compiled version. Your support helps me continue to improve and maintain this project.

<a href="https://ko-fi.com/s/117a6b9e39" target="_blank">Support me on ko-fi</a>

<a href="https://donate.stripe.com/fZe9DK9Fz2cK1PO8ww" target="_blank">Donate via Stripe</a>

Thank you for your support!

## License

[MIT License](LICENSE)

## Acknowledgements

- Thanks to the Elgato Stream Deck SDK for making this plugin possible.
- GitHub for providing the API to retrieve contribution data.

## Support

If you encounter any problems or have any questions, please open an issue on this GitHub repository.

---

Enjoy keeping track of your GitHub contributions right from your Stream Deck!

**Arturo Carretero Calvo - 2024**