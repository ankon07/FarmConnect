# FarmConnect

## Project Description
FarmConnect is a comprehensive mobile application designed to assist farmers with various aspects of their agricultural operations. It provides tools for crop diagnosis, management of farm inputs like fertilizers and machinery, real-time price tracking, weather updates, and efficient contact management. The application aims to streamline daily farming tasks and provide valuable insights to enhance productivity and decision-making.

## Features
- **Authentication:** Secure user login and registration.
- **Dashboard:** A central hub with quick access buttons and widgets, including weather updates and quick tips for farming.
- **Diagnosis:** Tools to help diagnose crop issues or other farm-related problems.
- **Input Management:** Modules for managing fertilizers, machinery, and repair needs.
- **Price Tracking:** Real-time or near real-time tracking of agricultural product prices.
- **Contact Management:** Organize and manage contacts related to farming activities.
- **Location Context:** Utilizes location services to provide relevant information (e.g., local weather).
- **API Integrations:** Connects with external APIs for data like weather and potentially AI-powered insights (Gemini API).

## Installation

To set up and run the FarmConnect project locally, follow these steps:

### Prerequisites
- Node.js (LTS version recommended)
- npm, yarn, or bun (package manager)
- Expo CLI: `npm install -g expo-cli` or `yarn global add expo-cli` or `bun install -g expo-cli`

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ankon07/FarmConnect.git
    cd FarmConnect
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    bun install
    ```

3.  **Start the Expo development server:**
    ```bash
    expo start
    # or
    npm start
    # or
    yarn start
    # or
    bun start
    ```

    This will open a new tab in your browser with the Expo Dev Tools. You can then open the app on your physical device using the Expo Go app or on an emulator/simulator.

## Usage
Once the Expo development server is running, you can:
- Scan the QR code displayed in the terminal or Expo Dev Tools with the Expo Go app on your mobile device.
- Use an Android emulator or iOS simulator.
- Press `w` in the terminal to open the app in a web browser (though mobile features might be limited).

Navigate through the different tabs and features to explore the application's functionalities.

## Technologies Used
-   **React Native:** For building native mobile applications using JavaScript and React.
-   **Expo:** A framework and platform for universal React applications, simplifying development and deployment.
-   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
-   **Zustand:** A small, fast, and scalable bear-bones state-management solution.
-   **React Navigation:** For handling navigation within the application.
-   **Gemini API:** For AI-powered features (e.g., diagnosis).

## Contributing
Contributions are welcome! If you'd like to contribute to FarmConnect, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Create a new Pull Request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.
