import React, { useState } from 'react';
import axios from 'axios';
import { FaUserAlt, FaRobot } from 'react-icons/fa';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages([...messages, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat/', {
        message: userInput,
      });

      const botMessage = { sender: 'bot', text: response.data.response };
      setLoading(false); // Hide loading as soon as response starts
      simulateTyping(botMessage);

    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setLoading(false);
    }
  };

  const simulateTyping = (botMessage) => {
    let index = 0;
    const message = botMessage.text;
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: '' }, // Start with an empty bot message
    ]);

    const interval = setInterval(() => {
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        return [
          ...prevMessages.slice(0, prevMessages.length - 1),
          { sender: 'bot', text: lastMessage.text + message[index] },
        ];
      });
      index++;
      if (index === message.length) {
        clearInterval(interval);
      }
    }, 5);
  };

  const renderFormattedText = (text) => {
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic

    return { __html: formattedText };
  };

  return (
    <div className="h-screen px-40 bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full h-screen  bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 h-5/6 overflow-y-auto custom-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="flex items-center space-x-2">
                  <div className="text-blue-500">
                    <FaUserAlt />
                  </div>
                  <div
                    className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white max-w-xs md:max-w-md lg:max-w-lg break-words"
                    dangerouslySetInnerHTML={renderFormattedText(msg.text)}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="text-gray-400">
                    <FaRobot />
                  </div>
                  <div
                    className="inline-block px-4 py-2 rounded-lg bg-gray-700 text-gray-300 max-w-xs md:max-w-md lg:max-w-lg break-words"
                    dangerouslySetInnerHTML={renderFormattedText(msg.text)}
                  />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-left animate-pulse">
              <div className="inline-block px-4 py-2 rounded-lg bg-gray-700 text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="block w-2 h-2 bg-white rounded-full"></span>
                    <span className="block w-2 h-2 bg-white rounded-full"></span>
                    <span className="block w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <input
            type="text"
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:outline-none focus:border-blue-500"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
