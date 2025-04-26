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

    // Translate function using Axios
    const handleTranslate = async () => {
        try {
            const response = await axios.post("http://localhost:5000/translate", {
                text: inputText,
                lang_from: sourceLang,
                lang_to: targetLang,
            });
            setArraySourceText(response.data.source);
            setArrayTranslatedText(response.data.translation);
        } catch (error) {
            console.error("Error translating text:", error);
        }
    };

    // Real-time translation using WebSocket
    const handleTranslateStream = () => {
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
            socket.disconnect();
        });

        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
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
                        ></textarea>
                        <br />
                        <button onClick={handleTranslateStream}>Translate</button>
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