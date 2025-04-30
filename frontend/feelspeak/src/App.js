import React, { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Edition from "./components/edition";
import languages from "./assets/languages.json";
import "./App.css";

function App() {
    const [inputText, setInputText] = useState("");
    const [sourceLang, setSourceLang] = useState("en");
    const [targetLang, setTargetLang] = useState("zh");
    const [isEditMode, setIsEditMode] = useState(false); // State to toggle between modes
    const [arraySourceText, setArraySourceText] = useState([]);
    const [arrayTranalatedText, setArrayTranslatedText] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false); // State to toggle between Text and Voice modes
    const [isTranslating, setIsTranslating] = useState(false);

    // Voice-to-text recording function
    // add: button press
    const startRecording = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = sourceLang; // Set the language for recognition
        recognition.interimResults = true; // Show interim results while speaking
        recognition.continuous = false; // Stop after one phrase

        recognition.onstart = () => {
            setIsRecording(true);
            console.log("Recording started...");
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .filter((result) => result.isFinal)
                .map((result) => result[0].transcript)
                .join("");
            setInputText((prev) => {
                const current = prev + " " + transcript; // Append the transcript to the input text
                return current.trim();
            }); // Append the transcript to the input text
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.onend = async () => {
            if (isRecording) {
                // Restart recognition automatically if still recording
                console.log("Recognition ended, restarting...");
                recognition.start();
            } else {
                console.log("Recording stopped.");
            }
        };

        recognition.start();
    };

    const stopRecording = () => {
        setIsRecording(false);
        console.log("Recording manually stopped.");
    };

    // Real-time translation using WebSocket
    const handleTranslateStream = () => {
        setIsTranslating(true);
        setArraySourceText([]);
        setArrayTranslatedText([]);
        const socket = io("http://localhost:5000");
        socket.emit("start_translation", {
            text: inputText,
            lang_from: sourceLang,
            lang_to: targetLang,
        });

        socket.on("translation", (data) => {
            setArraySourceText((prev) => [...prev, data.source]);
            setArrayTranslatedText((prev) => [...prev, data.translation]);
        });

        socket.on("translation_complete", (data) => {
            console.log(data.message);
            setIsTranslating(false); // Translation ends
            socket.disconnect();
        });

        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
            setIsTranslating(false); // Handle errors
        });
    };

    const switchToTranslationMode = (e) => {
        e.preventDefault();
        setIsEditMode(false);
    };

    const switchToEditionMode = (e) => {
        e.preventDefault();
        setIsEditMode(true);
    };

    return (
        <div className="app-container">
            {/* Left-Side Navigation Bar */}
            <nav className="left-navbar">
                <ul className="nav-links">
                    <li>
                        <a href="/translation" onClick={switchToTranslationMode}>
                            Translation
                        </a>
                    </li>
                    <li>
                        <a href="/details" onClick={switchToEditionMode}>
                            Details
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="main-content">
                {isEditMode ? (
                    <Edition
                        arraySourceText={arraySourceText}
                        arrayTranalatedText={arrayTranalatedText}
                        sourceLang={sourceLang}
                        targetLang={targetLang}
                    />
                ) : (
                    <div id="translation">
                        <div className="language-select-row">
                            <div>
                                <label>
                                    From:
                                    <select
                                        value={sourceLang}
                                        onChange={(e) => {
                                            setSourceLang(e.target.value);
                                            setArraySourceText([]);
                                            setArrayTranslatedText([]);
                                        }}
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div>
                                <label>
                                    To:
                                    <select
                                        value={targetLang}
                                        onChange={(e) => {
                                            setTargetLang(e.target.value);
                                            setArraySourceText([]);
                                            setArrayTranslatedText([]);
                                        }}
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            {isVoiceMode && (
                            <button className="switch-mode-button" onClick={isRecording ? stopRecording : startRecording}>
                                    {isRecording ? "Recording..." : "Start Recording"}
                                </button>
                            )}
                            <button className="switch-mode-button" onClick={() => setIsVoiceMode((prev) => !prev)}>
                                {isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
                            </button>
                        </div>
                        <textarea
                            rows="10"
                            placeholder="Enter text to translate..."
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                setArraySourceText([]);
                                setArrayTranslatedText([]);
                            }}
                            disabled={isVoiceMode} // Disable textarea in Voice Mode
                        ></textarea>
                        <div className="translation-section">
                            <button
                                className="translate-button"
                                onClick={handleTranslateStream}
                                disabled={!inputText.trim() || isTranslating} // Disable button while translating
                            >
                                {isTranslating ? "Language Translating..." : "Translate"}
                            </button>
                        </div>
                        <h3>Translations:</h3>
                        <div className="translation-box">
                            <p>{arrayTranalatedText.join(" ")}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;