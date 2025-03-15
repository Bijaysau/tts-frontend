import axios from "axios";
import { tailChase } from "ldrs";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoIosPlay } from "react-icons/io";
import { MdDelete } from "react-icons/md";

// Import Google Font
import "@fontsource/poppins";

const API_BASE_URL =
  import.meta.env.VITE_API_LIVE_PATH || "http://localhost:5000";

const TTSConverter = () => {
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [audioDurations, setAudioDurations] = useState({});

  const handleConvert = async () => {
    if (!text.trim()) {
      toast.error("❌ Please enter text to convert!");
      return;
    }
    tailChase.register();
    setLoading(true);
    setAudioSrc("");
    try {
      const response = await axios.post(`${API_BASE_URL}/tts`, { text });
      if (response.data && response.data.audioUrl) {
        setAudioSrc(response.data.audioUrl);
        toast.success("✅ Audio generated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("❌ Failed to generate speech. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data);
      setShowHistory(true);
      toast.success("✅ History loaded!");
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("❌ Failed to load history!");
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/history/${id}`);
      setHistory(history.filter((item) => item.id !== id));
      toast.success("✅ History item deleted!");
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("❌ Failed to delete history item!");
    }
  };

  const handleLoadedMetadata = (event, id) => {
    const duration = event.target.duration;
    setAudioDurations((prev) => ({ ...prev, [id]: duration }));
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#1b1b22] p-8 text-white space-y-8 font-[Poppins]">
      <Toaster position="top-right" reverseOrder={false} />
      <p className="absolute top-2 left-2 text-sm text-gray-400">
        Developed by Bijay Sau
      </p>
      <div className="w-full max-w-3xl p-8 border-2 border-white/20 rounded-2xl backdrop-blur-lg bg-[#2a2a35]">
        <h1 className="text-4xl font-bold mb-6">Text To Speech Converter</h1>
        <textarea
          className="w-full p-4 border rounded-lg shadow-md focus:ring focus:ring-[#915eff] bg-[#1b1b22] hover:bg-[#282832] text-lg"
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
      {audioSrc && (
        <div className="w-full max-w-3xl p-4 mt-6 border-2 border-white/20 rounded-2xl bg-[#2a2a35]">
          <h2 className="text-xl font-bold mb-2">Playback</h2>
          <audio controls className="w-full mt-2 rounded-lg">
            <source src={audioSrc} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
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
