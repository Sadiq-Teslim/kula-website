# Kula - The AI Companion for Every New Mother




**Live Demo:** [https://kula1.netlify.app](https://kula1.netlify.app)


## 1. The Problem
In Nigeria, a new mother's joy is often shadowed by anxiety. Late at night, when her baby has a strange symptom or an inconsolable cry, who can she turn to? Access to immediate, trusted medical advice is a major challenge. The silent struggle with postpartum depression is pervasive due to cultural stigma. Kula was built to be the first line of support.


## 2. Our Solution
Kula is a warm, empathetic, and intelligent AI companion designed to be accessible to every mother. It provides a safe space to ask questions, get reassurance, and receive critical, AI-powered early warnings for common infant health issues.


## 3. Key Features
- **Conversational AI:** Talk to Kula in English or local dialects (like Yoruba) and receive safe, helpful advice in a natural, conversational format.
- **Visual Analysis:** Upload a photo of a symptom (e.g., umbilical cord stump) and get instant analysis and guidance using a custom-trained machine learning model.
- **Multi-Modal Input:** Interact with Kula via voice, text, or camera, making it flexible and easy to use.
- **Built for Accessibility:** As a Progressive Web App, Kula works on any device with a web browser, from the latest smartphone to a simple tablet.


## 4. Tech Stack
- **Frontend:** React (Vite), TailwindCSS
- **Backend:** Node.js, Express.js
- **AI Brain (LLM):** Google Gemini
- **AI Vision:** Google's Teachable Machine (TensorFlow.js)
- **Database/State:** React State


## 5. How to Run Locally

### Backend
1. Navigate to the `kula-server` directory (or your backend folder).
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your API keys and configuration.
4. Start the server: `node server.js` (or `npm run start` if available).

### Frontend
1. Navigate to the `kula-webapp` directory (or your frontend folder).
2. Run `npm install` to install dependencies.
3. Update the `SERVER_IP` in `src/App.tsx` to match your backend server's IP address.
4. Start the development server: `npm run dev`.