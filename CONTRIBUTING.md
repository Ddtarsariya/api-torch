# Contributing to APITorch

First off, thank you for considering contributing to **APITorch**!  
It's people like you that make APITorch such a great tool.

---

## 🐞 Reporting Bugs

Help us improve by reporting bugs in a clear and constructive way.

### Before Submitting a Bug Report:

- Search existing issues to avoid duplicates.
- Try to reproduce the problem in the latest version.

### How to Submit a Great Bug Report:

Please include the following in your GitHub issue:

- **Title**: A clear and descriptive summary.
- **Steps to Reproduce**: Include detailed steps and examples (code snippets, links, etc.).
- **Expected vs Actual Behavior**: What did you expect? What happened?
- **Screenshots/GIFs**: If visual, attach supporting media.
- **Environment Details**: OS, browser (if applicable), and versions used.

---

## 🚀 Suggesting Enhancements

We welcome feature suggestions and improvements.

### Before Submitting an Enhancement:

- Check if it already exists or has been discussed.
- Make sure it aligns with the project's scope and goals.

### How to Submit a Great Enhancement Suggestion:

- **Title**: Descriptive and clear.
- **Detailed Description**: Outline the feature and its use case.
- **Behavior Change**: What it does now vs. what you want it to do.
- **Visuals**: Screenshots or mockups if applicable.
- **Justification**: Why is this valuable to API-Torch users?
- **Prior Art**: Reference similar features in other tools (if any).

---

## 📦 Pull Requests

Help us build a better tool by submitting PRs that meet the following guidelines:

### 🛠️ Steps to Contribute:

1. **Fork** the repository and create your branch from `main`.
2. **Install dependencies**:  
   ```bash
   npm install
   # or
   yarn install
   ```
3. Make your changes: Follow coding guidelines.

4. Write tests (if applicable).

5. Update documentation to reflect changes.

6. Run tests:
    ```bash
    npm test
    # or
    yarn test
    ```

7. Run linter:
    ```bash
    npm run lint
    # or
    yarn lint
    ```

8. Submit a Pull Request to the main branch.
You may be asked to make changes before your PR can be accepted.

## 🧭 Style Guides

### ✍️ Git Commit Messages

- Use **present tense** (e.g., `Fix bug`, not `Fixed bug`)
- Use **imperative mood** (e.g., `Add feature`, not `Adds feature`)
- Limit the subject line to **72 characters**
- Use emoji prefixes where applicable:

    | Emoji | Code              | Description                      |
    |-------|-------------------|----------------------------------|
    | 🎨    | `:art:`           | Code style/structure updates     |
    | 🐛    | `:bug:`           | Bug fixes                        |
    | 🚀    | `:rocket:`        | New features                     |
    | 📝    | `:memo:`          | Documentation updates            |
    | ✅    | `:white_check_mark:` | Tests                         |
    | 🔒    | `:lock:`          | Security fixes                   |
    | ♻️    | `:recycle:`       | Refactoring                      |
    | 🔧    | `:wrench:`        | Tooling/configuration            |
    | 🔥    | `:fire:`          | Remove code or files             |

---

### 🧑‍💻 JavaScript/TypeScript Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Prefer `const` over `let`, and avoid `var`
- Use **arrow functions**
- Prefer **template literals** over string concatenation
- Use **destructuring** and the **spread operator**
- Write **meaningful variable names**
- Add **comments for complex logic**

---

### ⚛️ React/JSX Style

- Use **functional components** with **hooks**
- Use `React.FC` for typing functional components
- Destructure **props**
- Use `useState`, `useEffect`, and other hooks appropriately
- Keep components **small** and **focused**
- Use **PascalCase** for components, **camelCase** for variables
- Extract **complex rendering logic** into separate components

---

## 🏷️ Issue and PR Labels

| Label               | Meaning                      |
|---------------------|------------------------------|
| `bug`               | A confirmed bug              |
| `documentation`     | Related to documentation     |
| `duplicate`         | Already reported             |
| `enhancement`       | New feature request          |
| `good first issue`  | Easy for newcomers           |
| `help wanted`       | Needs community help         |
| `invalid`           | Not a valid issue            |
| `question`          | Needs clarification          |
| `wontfix`           | Not planned to fix           |

---

## 🙌 Thank You!

Your time and efforts help make **APITorch** better for everyone.  
Every issue, suggestion, and PR—big or small—means a lot.
