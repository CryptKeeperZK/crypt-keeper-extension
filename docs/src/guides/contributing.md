# 🛠 Contribution Guidelines

Welcome to our project! We appreciate your interest in contributing. This document provides detailed instructions on setting up the development environment, running the demo, and performing end-to-end testing.

## Development Environment Setup

To get started with development, follow these steps:

1. **Install [pnpm](https://pnpm.io/):** If you haven't already, make sure to install pnpm, which is our package manager of choice.

2. **Install Project Dependencies:** Run the following command to install the project's dependencies:

```bash
pnpm install
```

3. **Start the Development Build:** Launch the development server with this command:
```bash
pnpm run dev
```

4. **Load Extension in Your Browser:** Load the dist directory as an unpacked extension in your web browser.

## Running the Demo

To run the project's demo, follow these steps:

1. **Development Environment:** Ensure you have set up the development environment as outlined above.

2. **Build or Start the Demo:** Choose one of the following options based on your preference:
    1. To build the demo, make sure you finished the setup steps.
    2. To start the merkle tree mock server, execute these commands:
    ```bash
    pnpm run merkle:start
    ```
    3. To start the demo, execute these commands:
    ```bash
    pnpm run demo:start
    ```

## End-to-End Testing

If you'd like to contribute by running end-to-end tests, follow these steps:

1. **Install Playwright Dependencies:** Install Playwright dependencies for Chromium by running the following command:

```bash
    pnpx playwright install --with-deps chromium
```

2. **Install Extension and Demo Dependencies:** Make sure you have installed dependencies for both the extension and the demo:

```bash
    pnpm install
```

3. **Configure .env.test File:** 
    - Create a `.env.test` file and set the `METAMASK_EXTENSION_ID`. 
    - You can find the `METAMASK_EXTENSION_ID` in the log output when running the end-to-end tests `pnpm run e2e`. Different environments may require different `METAMASK_EXTENSION_ID` values, so be sure to specify it explicitly.

4. **Build the Extension for Testing:** Build the extension for end-to-end testing:

```bash
    pnpm run build:e2e
```

5. **Run End-to-End Tests:** Execute the following command to run Playwright end-to-end tests:

```bash
    pnpm run e2e
```

Thank you for considering contributing to our project. We look forward to your valuable contributions!