# 🔥 API-Torch

> A blazing-fast, developer-first API testing platform built with **TypeScript**, **React**, and **Vite**.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-⚡-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-ff69b4.svg)](https://github.com/Ddtarsariya/api-torch/blob/master/CONTRIBUTING.md)

---

<img src="https://raw.githubusercontent.com/Ddtarsariya/api-torch/master/public/logo.png" alt="APITorch Logo" width="200"/>

## 📸 Screenshots

Take a look at some key views of **API-Torch**:

<table>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Ddtarsariya/api-torch/master/public/request.png" alt="RequestPanel" width="100%"/></td>
    <td><img src="https://raw.githubusercontent.com/Ddtarsariya/api-torch/master/public/mode.png" alt="Dark Mode" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Ddtarsariya/api-torch/master/public/runner.png" alt="Runner" width="100%"/></td>
    <td><img src="https://raw.githubusercontent.com/Ddtarsariya/api-torch/master/public/environment.png" alt="Environment and Variables" width="100%"/></td>
  </tr>
</table>

## ✨ Features

**API-Torch** is a powerful and intuitive API testing tool designed to supercharge your API development workflow. Whether you're debugging, testing, or building from scratch — API-Torch has you covered.

---

## 🚀 Core Features

- ⚙️ **Intuitive Request Builder** – Craft HTTP requests with a powerful code-friendly editor
- 🗂️ **Collections & Workspaces** – Organize and manage your API endpoints effortlessly
- 🌍 **Environment Variables** – Define reusable variables for different environments
- 🧪 **Pre-request Scripts** – Execute JavaScript logic before sending a request
- ✅ **Test Scripts** – Validate responses with custom assertions
- 🕓 **Request History** – Track and revisit past API calls
- 📦 **Import/Export** – Supports OpenAPI, Swagger, and Postman formats

---

## 🔍 Advanced Capabilities

- 👁️ **Multi-format Response Viewer** – Toggle between JSON, raw, and preview modes
- 🔗 **Request Chaining** – Reuse data from previous requests
- 🧹 **Bulk Operations** – Enable, disable, or delete multiple items in one go
- 📊 **Performance Metrics** – Track latency and payload sizes
- 🧬 **Code Generation** – Generate ready-to-use snippets in various languages
- ⏱️ **Request Runner** – Run sequences of requests with custom delays

---

## 🖥️ Screenshots

_Coming soon – visual walkthroughs of the features above!_

---

## 🚀 Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/) **v16.x or higher**
- npm or yarn

### 📥 Installation

Clone the repository:

```bash
git clone [https://github.com/Ddtarsariya/api-torch.git](https://github.com/Ddtarsariya/api-torch.git) # Replace yourusername with the actual GitHub username
cd api-torch
```

Install dependencies:

```bash
npm install
# or
yarn install
```

▶️ Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Now, open http://localhost:5173 to start using API-Torch.

## 🏗️ Project Structure

```bash
api-torch/
├── src/
│   ├── components/     # UI components
│   │   ├── request/    # Request-related UI
│   │   ├── response/   # Response display logic
│   │   ├── runner/     # Multi-request runner
│   │   ├── ui/         # Shared UI components
│   │   └── ...
│   ├── lib/            # Utility and helper functions
│   ├── store/          # Global state (Zustand)
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Root app component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── ...
```

---

## 🛣️ Roadmap

Here's a sneak peek at what's coming next:

- 👥 **Team Collaboration** – Share workspaces with teammates
- ☁️ **Cloud Sync** – Sync your environment across devices
- 🧪 **Mock Server** – Serve mock APIs directly from collections
- 🧬 **GraphQL Support** – Richer GraphQL querying and testing
- 🔐 **Auth Helpers** – OAuth2, API key, and more built-in flows
- 💥 **Performance Testing** – Lightweight load testing tools
- 🔄 **CI/CD Integration** – Plug into your pipeline for automated API tests

---

## 🤝 Contributing

We ❤️ open source! Contributions of any kind are welcome:

1.  Fork the project
2.  Create a feature branch: `git checkout -b feature/AmazingFeature`
3.  Commit your changes: `git commit -m 'Add some AmazingFeature'`
4.  Push to your branch: `git push origin feature/AmazingFeature`
5.  Open a pull request

Check out our [Contributing Guide](https://github.com/Ddtarsariya/api-torch/blob/master/CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](https://github.com/Ddtarsariya/api-torch/blob/master/LICENSE) file for details.

---

## 🙏 Acknowledgments

API-Torch is built with love and powered by these awesome tools:

- [Radix UI](https://www.radix-ui.com/) – Accessible UI primitives
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) – VS Code's powerful code editor
- [Axios](https://axios-http.com/) – Elegant HTTP client
- [Zustand](https://zustand-demo.pmnd.rs/) – Simplified state management
- [Tailwind CSS](https://tailwindcss.com/) – Modern utility-first styling

Happy testing! 🚀