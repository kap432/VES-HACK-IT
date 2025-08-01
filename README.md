# Project Setup Guide

## Prerequisites
Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation
### 1. Install Dependencies from `package-lock.json`
To install all dependencies for the project using the `package-lock.json` file, run the following command in each relevant directory:

```sh
npm ci
```

This ensures that all dependencies are installed exactly as specified in `package-lock.json`, avoiding version mismatches.

## Running the Frontend
### 1. Navigate to the Frontend Directory
If your frontend is in the `veshackit` folder, navigate to it:

```sh
cd veshackit
```

### 2. Start the Frontend
Run the following command to start the frontend:

```sh
npm start
```

This will start the development server, usually accessible at `http://localhost:3000/`.

## Running the Backend
### 1. Navigate to the Root Directory
If your backend is located in the project root folder, navigate there:

```sh
cd ..  # Move to the root directory (if not already there)
```

### 2. Start the Backend Server
Run the following command to start the backend:

```sh
node server.js
```

This will start the backend server, usually accessible at `http://localhost:5000/` (depending on your configuration).

## Notes
- If you face permission issues while installing dependencies, try running `npm ci` with `sudo` (Linux/macOS users):
  
  ```sh
  sudo npm ci
  ```
  
- If `npm start` does not work, try running:
  
  ```sh
  npm install
  ```
  
  and then retry `npm start`.

- Ensure that both the frontend and backend are running simultaneously for proper functionality.

## Troubleshooting
- **Port conflicts:** If the default ports are in use, change them in the respective configurations (`package.json` for frontend and `server.js` for backend).
- **Dependency issues:** Delete `node_modules` and `package-lock.json`, then run:
  
  ```sh
  npm install
  ```

