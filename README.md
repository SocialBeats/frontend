# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



## 🚀 Quick Start

Follow these steps to get the local development environment up and running.

1.  **Clone the repository:**
    ```bash
    git clone [YOUR-NEW-REPO-URL]
    cd [repository-name]
    ```

2.  **Install dependencies:**
    This project uses `pnpm`.
    ```bash
    pnpm install
    ```

3.  **Run the application:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 🏛️ Architecture and Contribution Guidelines

This repository is a **common frontend** for 5 microservices. To allow 5 pairs to work in parallel without conflicts, we follow a strict **domain isolation** architecture.

The golden rule is: **Each pair "owns" their service files, their pages, and their components.**



### `src` Structure

* **`src/api/`**: **INFRASTRUCTURE.** Contains the `axiosClient` that **automatically injects the JWT** into all requests.
    * **Rule:** *Nobody* touches this folder. Import and use the client it exports.

* **`src/services/`**: **EACH PAIR'S DOMAIN.** This is the most important "plot" of land. All communication logic with your backend lives here.
    * **Rule:** Each pair creates and maintains their own service file (e.g., `beatsService.js`). Modifying another pair's service file is **prohibited**.

* **`src/pages/`**: **EACH PAIR'S DOMAIN.** This is where views (full pages) are created. Each page must import data *exclusively* from the `services` layer.
    * **Rule:** Create your pages and add them to the router in `src/App.jsx`.

* **`src/components/ui/`**: **SHARED (UI Kit).** This is your Shadcn/UI component library.
    * **Rule:** It is **mandatory** to use these components (Button, Input, Card, etc.) to maintain visual consistency. Do not use native HTML tags like `<button>` or `<input>`.

* **`src/components/auth-provider.jsx`**: **INFRASTRUCTURE (Owned by Pair 1).** This is the global state manager for authentication.
    * **Rule:** *Nobody* (except Pair 1) should touch this file. The rest of the team consumes it via the `useAuth()` hook.

---

## 📜 Golden Rules of the Workflow

> 1.  **NO direct `fetch()` or `axios()`:** NEVER call an API from a page or component. *Always* use your file from `src/services/`.
> 2.  **USE the UI Kit:** Don't invent components. Use the ones in `src/components/ui/` to keep the app consistent.
> 3.  **DON'T touch another's Service:** Respect the "plots". If you need data from another microservice, talk to that pair so they can expose a function in their *service* for you to import.
> 4.  **USE GitHub Flow:**
    * The `main` branch is protected.
    * Create *feature branches* from `main` (e.g., `feat/P3/upload-beat-page`).
    * Make Pull Requests (PRs) to integrate your changes.
    * Approval from at least 1 teammate (who is not you) is required to merge.
