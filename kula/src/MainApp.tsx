import { useState, useEffect, useRef } from "react";
import axios from "axios";

// --- Server Configuration ---
// const SERVER_IP = "192.168.57.168"; // Your IP Address
const SERVER_URL = `https://kula-server.onrender.com/interact`;

// --- Web Speech Recognition ---
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "en-US";

// --- Type Definitions ---
type Message = {
  role: "user" | "ai" | "typing";
  text: string;
  imageUrl?: string; // Optional image URL for visual analysis messages
};

type TeachableMachinePrediction = {
  className: string;
  probability: number;
};

type TeachableMachineModel = {
  predict: (img: HTMLImageElement) => Promise<TeachableMachinePrediction[]>;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [teachableMachineModel, setTeachableMachineModel] =
    useState<TeachableMachineModel | null>(null);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    } else {
      recognition.start();
    }
  };

  recognition.onstart = () => setIsListening(true);
  recognition.onend = () => setIsListening(false);
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const spokenText = event.results[0][0].transcript;
    setConversation((prev) => [...prev, { role: "user", text: spokenText }]);
    sendToServer(spokenText);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!teachableMachineModel) return alert("Model not loaded yet.");
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const userMessage: Message = {
      role: "user",
      text: "Analyzing photo...",
      imageUrl,
    };
    setConversation((prev) => [...prev, userMessage]);

    const img = new window.Image();
    img.src = imageUrl;
    img.onload = async () => {
      const prediction = await teachableMachineModel.predict(img);
      const topPrediction = prediction.reduce((prev, current) =>
        prev.probability > current.probability ? prev : current
      );
      const messageForKula = `I have analyzed a photo and the result is: ${topPrediction.className}. What is your advice?`;

      setConversation((prev) => {
        const newConversation = [...prev];
        const lastMessage = newConversation[newConversation.length - 1];
        lastMessage.text = `Analysis Result: ${topPrediction.className}`;
        return newConversation;
      });
      sendToServer(messageForKula);
    };
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setConversation((prev) => [...prev, { role: "user", text: inputText }]);
    sendToServer(inputText);
    setInputText("");
  };

  const sendToServer = async (message: string) => {
    setIsLoading(true);
    setConversation((prev) => [...prev, { role: "typing", text: "..." }]);
    try {
      const response = await axios.post<{ reply: string }>(SERVER_URL, {
        message,
      });
      setConversation((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: response.data.reply },
      ]);
    } catch (error) {
      console.error("Server Error:", error);
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
      <div className="flex items-center p-4 border-b border-gray-200 shadow-sm">
        <img src="/kula-logo.png" alt="Kula Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-[#4AA8A4] ml-3">Kula</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversation.length === 0 && (
          <div className="bg-gray-200 p-4 rounded-xl rounded-tl-none max-w-[85%] self-start">
            <p className="text-gray-700">
              Hello Mama! I'm Kula. Tap the mic to talk, type a message, or use
              the camera icon to analyze a photo.
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
              className={`p-3 px-4 rounded-2xl max-w-[85%] ${
                msg.role === "user"
                  ? "bg-[#4AA8A4] text-white rounded-tr-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Uploaded content"
                  className="rounded-lg mb-2"
                />
              )}
              {msg.role === "typing" ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <p
                  className={`leading-relaxed ${
                    msg.text.startsWith("Analysis Result:") &&
                    msg.role === "user"
                      ? "animate-pulse font-semibold"
                      : ""
                  }`}
                >
                  {msg.text}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Interaction Area */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!teachableMachineModel || isLoading}
          className="p-2"
        >
          <img
            src="/camera-icon.png"
            alt="Upload a Photo"
            className="w-6 h-6"
          />
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={!teachableMachineModel || isLoading}
          className="p-2"
        >
          <img
            src="/live-camera-icon.png"
            alt="Use Live Camera"
            className="w-6 h-6"
          />
        </button>

        <form onSubmit={handleTextSubmit} className="flex-1 mx-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4AA8A4]"
            disabled={isLoading}
          />
        </form>

        <button
          onClick={inputText ? handleTextSubmit : handleVoicePress}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full flex justify-center items-center transition-colors ${
            isListening ? "bg-[#F4A261]" : "bg-[#4AA8A4]"
          }`}
        >
          {isListening ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : inputText ? (
            <img src="/send-icon.png" alt="Send" className="w-6 h-6 invert" />
          ) : (
            <img
              src="/mic-icon.png"
              alt="Microphone"
              className="w-6 h-6 invert"
            />
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
          capture="environment"
        />
      </div>
    </div>
  );
}
