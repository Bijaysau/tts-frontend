import axios from "axios";
import { tailChase } from "ldrs";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoIosPlay } from "react-icons/io";
import { MdDelete } from "react-icons/md";

// Main component for Text-to-Speech Converter
const TTSConverter = () => {
  // State variables to store user input, audio source, loading state, history, etc.
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [audioDurations, setAudioDurations] = useState({});

  // Function to handle text-to-speech conversion
  const handleConvert = async () => {
    if (!text.trim()) {
      // Check if text input is empty
      toast.error("❌ Please enter text to convert!");
      return;
    }

    tailChase.register(); // Initialize loading spinner
    setLoading(true);
    setAudioSrc("");

    try {
      // Send POST request to backend TTS API
      const response = await axios.post("http://localhost:5000/tts", { text });

      // Check if the response contains a valid audio URL
      if (response.data && response.data.audioUrl) {
        setAudioSrc(response.data.audioUrl); // Set the audio source for playback
        toast.success("✅ Audio generated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("❌ Failed to generate speech. Try again!");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Function to fetch conversion history from backend
  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/history");
      setHistory(response.data); // Update history state
      setShowHistory(true);
      toast.success("✅ History loaded!");
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("❌ Failed to load history!");
    }
  };

  // Function to delete a history item by ID
  const deleteHistoryItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/history/${id}`);
      setHistory(history.filter((item) => item.id !== id)); // Remove deleted item from history
      toast.success("✅ History item deleted!");
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("❌ Failed to delete history item!");
    }
  };

  // Function to get audio duration once metadata is loaded
  const handleLoadedMetadata = (event, id) => {
    const duration = event.target.duration;
    setAudioDurations((prev) => ({ ...prev, [id]: duration }));
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#1b1b22] p-8 text-white space-y-8">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Main container for TTS form */}
      <div className="w-full max-w-3xl p-8 border-2 border-white/20 rounded-2xl backdrop-blur-lg bg-[#2a2a35]">
        <h1 className="text-4xl font-bold mb-6">Text-to-Speech Converter</h1>
        <textarea
          className="w-full p-4 border rounded-lg shadow-md focus:ring focus:ring-[#915eff] bg-[#1b1b22] hover:bg-[#282832]"
          rows="6"
          placeholder="Type your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
          <button
            onClick={handleConvert}
            className="flex items-center justify-center text-3xl bg-gradient-to-r from-[#ee40eee3] to-[#ff4d4d] p-4 rounded-full shadow-lg hover:scale-110 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? (
              <l-tail-chase size="40" speed="3.0" color="white"></l-tail-chase>
            ) : (
              <IoIosPlay className="text-white" />
            )}
          </button>
          <button
            onClick={fetchHistory}
            className="px-6 py-3 bg-[#3a3a45] text-white rounded-lg shadow-lg hover:bg-[#4b4b55] transition"
          >
            Load History
          </button>
        </div>
      </div>

      {/* Audio playback section */}
      {audioSrc && (
        <div className="w-full max-w-3xl p-4 mt-6 border-2 border-white/20 rounded-2xl bg-[#2a2a35]">
          <h2 className="text-xl font-bold mb-2">Playback</h2>
          <audio controls className="w-full mt-2 rounded-lg">
            <source src={audioSrc} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* History display section */}
      {showHistory && (
        <div className="w-full max-w-3xl p-8 border-2 border-white/20 rounded-2xl backdrop-blur-lg bg-[#2a2a35]">
          <h2 className="text-2xl font-bold mb-4">Previous History</h2>
          <div className="max-h-96 overflow-y-auto border border-gray-700 p-4 rounded-lg bg-[#1b1b22]">
            {history.length === 0 ? (
              <p className="text-gray-400">No history found.</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 p-3 bg-[#3a3a45] rounded-lg flex justify-between items-center"
                >
                  <div className="w-full">
                    <p className="text-sm text-gray-300">{item.text}</p>
                    <audio
                      controls
                      className="mt-3 rounded-lg"
                      onLoadedMetadata={(event) =>
                        handleLoadedMetadata(event, item.id)
                      }
                    >
                      <source src={item.audio_url} type="audio/mp3" />
                    </audio>
                  </div>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="ml-4 flex justify-center bg-[#ff4d6d] text-white p-2 rounded-lg hover:bg-[#ff9a8b] transition"
                  >
                    <MdDelete />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSConverter;

// frontend, you used the following technologies:
// React.js — For building the user interface.
// Axios — To make HTTP requests to your backend (for TTS conversion and history fetching).
// Tailwind CSS — For styling the components.
// React Icons — For using icons like play, delete, etc.
// LDRS — For adding a loading spinner (tailChase animation).
// React Hot Toast — For showing notifications and alerts (success, error messages).
