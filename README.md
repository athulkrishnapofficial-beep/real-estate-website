# EPIC Properties - Real Estate Website

A modern, full-stack real estate website built with React, Vite, Tailwind CSS, and Firebase. This platform allows users to browse, search, and view property listings.

**Tagline:** "Real estate services un simplified way."

[**Live Demo Link**](https://your-live-demo-url.com) · [**Report Bug**](https://github.com/athulkrishnapofficial-beep/real-estate-website/issues) · [**Request Feature**](https://github.com/athulkrishnapofficial-beep/real-estate-website/issues)

---

## 🚀 Features

* **Firebase Authentication:** Secure user registration and login (Email/Password & Google OAuth).
* **Property Listings:** A clean, modern interface to browse all available properties.
* **Search & Filtering:** Functionality to search for properties based on location, price, or type.
* **Detailed Property Pages:** Each property has its own page with a full description, image gallery, and agent information.
* **Protected Routes:** A user profile page and other routes are protected, accessible only to logged-in users.
* **Responsive Design:** Fully responsive and mobile-first, built with Tailwind CSS.

## 🛠️ Tech Stack

* **Frontend:** [React.js](https://reactjs.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Routing:** [React Router](https://reactrouter.com/)
* **Backend & Database:** [Firebase](https://firebase.google.com/)
    * Firebase Authentication (for user accounts)
    * Firestore Database (for property listings)
    * Firebase Storage (for property images)

## 📦 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v18 or newer)
* `npm` or `yarn` package manager

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/athulkrishnapofficial-beep/real-estate-website.git](https://github.com/athulkrishnapofficial-beep/real-estate-website.git)
    cd real-estate-website
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Firebase:**
    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    * In your project, go to **Project Settings** > **General** and find your web app's configuration object.
    * Enable **Authentication** (Email/Password and Google providers).
    * Enable **Firestore Database**.
    * Enable **Storage**.

4.  **Create an environment file:**
    Create a `.env` file in the root of the project. Copy and paste your Firebase project configuration here. (Vite requires the `VITE_` prefix to expose variables to the client).

    ```
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

5.  **Run the development server:**
    ```sh
    npm run dev
    ```

    The application will be running on `http://localhost:5173` (or the next available port).

## 👤 Author

**Athul Krishna**
* **GitHub:** [@athulkrishnapofficial-beep](https://github.com/athulkrishnapofficial-beep)
* **Website:** [Athul krishna p](https://portfolio-website-tau-six-41.vercel.app/)
