import { useState, useEffect, useRef } from "react";
import axios from "axios"; // Simpler for API calls

// Extend Window interface for SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Server Configuration ---
const SERVER_IP = "192.168.57.168"; // Your IP Address
const SERVER_URL = `http://${SERVER_IP}:3000/interact`;

// --- Web Speech Recognition ---
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "en-US";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [teachableMachineModel, setTeachableMachineModel] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load Teachable Machine Model
  useEffect(() => {
    const loadModel = async () => {
      const tmImage = await import("@teachablemachine/image");
      const MODEL_URL =
        "https://teachablemachine.withgoogle.com/models/BaY5gFQ9K/";
      const model = await tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
      );
      setTeachableMachineModel(model);
      console.log("✅ Teachable Machine Model loaded!");
    };
    loadModel();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleVoicePress = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setConversation([]);
      recognition.start();
      setIsListening(true);
    }
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    setConversation([{ role: "user", text: spokenText }]);
    sendToServer(spokenText);
    setIsListening(false);
  };

  const handleImageUpload = async (event) => {
    if (!teachableMachineModel) return alert("Model not loaded yet.");
    const file = event.target.files[0];
    if (!file) return;

    setConversation([{ role: "user", text: "Analyzing photo..." }]);
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const prediction = await teachableMachineModel.predict(img);
      const topPrediction = prediction.reduce((prev, current) =>
        prev.probability > current.probability ? prev : current
      );
      const messageForKula = `I have analyzed a photo and the result is: ${topPrediction.className}. What is your advice?`;
      setConversation([
        { role: "user", text: `Analysis Result: ${topPrediction.className}` },
      ]);
      sendToServer(messageForKula);
    };
  };

  const sendToServer = async (message) => {
    setIsLoading(true);
    setConversation((prev) => [...prev, { role: "typing", text: "..." }]);
    try {
      const response = await axios.post(SERVER_URL, { message });
      setConversation((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: response.data.reply },
      ]);
    } catch (error) {
      setConversation((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "Connection error. Is the server running?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FEFBF6] h-screen flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <img src="/kula-logo.jpg" alt="Kula Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-[#4AA8A4] ml-3">Kula</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversation.length === 0 && (
          <div className="bg-gray-200 p-4 rounded-xl rounded-tl-none max-w-[85%] self-start">
            <p className="text-gray-700">
              Hello Mama! I'm Kula. Tap the mic to talk, or the camera to
              analyze a photo.
            </p>
          </div>
        )}
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } mb-3`}
          >
            <div
              className={`p-4 rounded-xl max-w-[85%] ${
                msg.role === "user"
                  ? "bg-[#4AA8A4] text-white rounded-tr-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.role === "typing" ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Interaction Area */}
      <div className="p-4 bg-white border-t border-gray-200 flex flex-col items-center">
        <button
          onClick={handleVoicePress}
          disabled={isLoading}
          className={`w-16 h-16 rounded-full flex justify-center items-center shadow-md ${
            isListening ? "bg-[#F4A261]" : "bg-[#4AA8A4]"
          }`}
        >
          <img
            src="/mic-icon.png"
            alt="Microphone"
            className="w-7 h-7 invert"
          />
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={!teachableMachineModel || isLoading}
          className="flex items-center mt-4"
        >
          <img src="/camera-icon.png" alt="Camera" className="w-5 h-5" />
          <span className="text-[#4AA8A4] font-semibold ml-2">
            Analyze a Photo
          </span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
}
