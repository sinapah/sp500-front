import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [questions, setQuestions] = useState([]);
  const [useT5, setUseT5] = useState(false);

  useEffect(() => {
    // Fetch questions when component mounts
    fetch("/questions.txt")
      .then((response) => response.text())
      .then((text) => {
        const questionsList = text
          .split("\n")
          .filter((line) => line.trim() !== "");
        setQuestions(questionsList);
      })
      .catch((error) => console.error("Error loading questions:", error));
  }, []);

  const getRandomQuestion = () => {
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setInput(questions[randomIndex]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Replace 'YOUR_API_ENDPOINT' with your actual endpoint
      const response = await axios.post(`${API_URL}/api/qa/`, {
        question: input,
        mode: useT5 ? "T5" : "BERT",
      });
      // Add bot response
      const botMessage = { text: response.data.answer, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Handle error (optional)
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong!", sender: "bot" },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4 text-center text-xl font-semibold">
        SP500 Analysis Chatbot
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="modelToggle"
              checked={useT5}
              onChange={(e) => setUseT5(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="modelToggle" className="text-sm text-gray-700">
              Use T5 Model (unchecked = BERT)
            </label>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button
              type="button"
              onClick={getRandomQuestion}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Random Question
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;
