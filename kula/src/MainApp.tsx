import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const SERVER_URL = `https://kula-server.onrender.com/interact`;

type Message = {
  role: "user" | "ai" | "typing";
  text: string;
  imageUrl?: string;
};
type TeachableMachinePrediction = { className: string; probability: number };
type TeachableMachineModel = {
  predict: (img: HTMLImageElement) => Promise<TeachableMachinePrediction[]>;
};
type AttachedImage = { file: File; previewUrl: string };

export default function MainApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [teachableMachineModel] = useState<TeachableMachineModel | null>(null);
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<typeof window.SpeechRecognition | null>(null);

  const sendToServer = useCallback(async (message: string) => {
    setIsLoading(true);
    setConversation((prev) => [...prev, { role: "typing", text: "..." }]);
    try {
      const response = await axios.post<{ reply: string }>(
        SERVER_URL,
        { message },
        { timeout: 60000 }
      );
      setConversation((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: response.data.reply },
      ]);
    } catch (error) {
      console.error("Server Error:", error);
      setConversation((prev) => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: "Mama, I'm very sorry for the delayed response. I'm having issues with network. Can you please try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      /* ... your model loading logic is fine ... */
    };
    loadModel();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.lang = "en-US";

    const handleRecognitionResult = (event: SpeechRecognitionEvent) => {
      const spokenText = event.results[0][0].transcript;
      console.log("[SpeechRecognition] Recognized:", spokenText);
      setConversation((prev) => [...prev, { role: "user", text: spokenText }]);
      sendToServer(spokenText);
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = handleRecognitionResult;

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
    };
  }, [sendToServer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handleVoicePress = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!teachableMachineModel) return alert("Model not loaded yet.");
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAttachedImage({ file, previewUrl });
    event.target.value = "";
  };

  const handleSend = async () => {
    if (!inputText.trim() && !attachedImage) return;
    let userMessageText = inputText;
    let imageUrlForChat: string | undefined = undefined;
    let promptForAI = inputText;

    if (attachedImage) {
      setIsLoading(true);
      const img = new window.Image();
      img.src = attachedImage.previewUrl;
      imageUrlForChat = attachedImage.previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const prediction = (await teachableMachineModel?.predict(img)) ?? [];
      const topPrediction = prediction.reduce((prev, current) =>
        prev.probability > current.probability ? prev : current
      );
      promptForAI = `A mother has sent this message: "${inputText}". She also attached a photo which my vision model analyzed with the result: "${topPrediction.className}". Please provide a single, combined response based on both her text and the photo analysis.`;
      if (!userMessageText) {
        userMessageText = `Analysis Result: ${topPrediction.className}`;
      }
    }

    setConversation((prev) => [
      ...prev,
      { role: "user", text: userMessageText, imageUrl: imageUrlForChat },
    ]);
    sendToServer(promptForAI);
    setInputText("");
    setAttachedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="w-full h-screen md:h-[800px] md:max-w-sm md:rounded-2xl md:shadow-2xl overflow-hidden bg-[#FEFBF6] flex flex-col font-sans relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex items-center p-4 border-b border-gray-200 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 mr-2">
            <img src="/menu-icon.png" alt="Menu" className="w-6 h-6" />
          </button>
          <img src="/kula-logo.png" alt="Kula Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-[#4AA8A4] ml-3">Kula</h1>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {conversation.length === 0 && (
            <div className="bg-gray-200 p-4 rounded-xl rounded-tl-none max-w-[85%] self-start">
              <p className="text-gray-700">
                Hello Mama! I'm Kula. Tap the mic to talk, type a message, or
                use the camera icon to analyze a photo.
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
                  <p className="leading-relaxed break-words">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-3 bg-white border-t border-gray-200">
          {attachedImage && (
            <div className="mb-2 relative">
              <img
                src={attachedImage.previewUrl}
                alt="Attachment preview"
                className="rounded-lg max-h-40 object-contain"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 rounded-full p-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!teachableMachineModel || isLoading}
              className="p-2 mt-2"
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
              className="p-2 mt-2"
            >
              <img
                src="/live-camera-icon.png"
                alt="Use Live Camera"
                className="w-6 h-6"
              />
            </button>
            <div className="flex-1 mx-2">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4AA8A4] resize-none overflow-y-hidden max-h-24"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={
                !inputText.trim() && !attachedImage
                  ? handleVoicePress
                  : handleSend
              }
              disabled={isLoading}
              className={`w-12 h-12 rounded-full flex justify-center items-center transition-colors shrink-0 mt-1 ${
                isListening ? "bg-[#F4A261]" : "bg-[#4AA8A4]"
              }`}
            >
              {isListening ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : !inputText.trim() && !attachedImage ? (
                <img
                  src="/mic-icon.png"
                  alt="Microphone"
                  className="w-6 h-6 invert"
                />
              ) : (
                <img
                  src="/send-icon.png"
                  alt="Send"
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
      </div>
    </div>
  );
}
