import React, { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import languages from "../assets/languages.json";
import emotions from "../assets/27emotions.json";

function Edition({ arraySourceText, arrayTranalatedText, sourceLang, targetLang }) {
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [clickedWord, setClickedWord] = useState("");
    const [dictionary, setDictionary] = useState({});
    const [selectedDefinition, setSelectedDefinition] = useState("");
    const [isSentimentLoading, setIsSentimentLoading] = useState(false);
    const [arraySentiment, setArraySentiment] = useState([]);

    
    const handleClick = async (word) => {
        setClickedWord(word);
        try {
            const response = await axios.get(`http://localhost:5000/dictionary?word=${word}&lang_from=${sourceLang}&lang_to=${targetLang}`);
            const data = response.data.json;
            const jsonData = typeof data === "string" ? JSON.parse(data) : data;
            console.log("Dictionary data:", jsonData);
            setDictionary(jsonData || {});
        } catch (error) {
            console.error("Error fetching dictionary data:", error);
        }
    };

    const handleDefinitionSelect = (definition) => {
        setSelectedDefinition(definition);
        console.log(`Selected definition for "${clickedWord}": ${definition}`);
    };

    const editDefinition = () => {
        if (!selectedDefinition) {
            console.error("No definition selected!");
            return;
        }
        const json = { [clickedWord]: selectedDefinition };
        console.log(json);
        setClickedWord("");
    };

    const triggerRealTimeSentiment = () => {
        setIsSentimentLoading(true);
        const socket = io("http://localhost:5000");

        socket.emit("start_sentiment", { sentences: arraySourceText });

        socket.on("sentiment", (data) => {
            console.log("Real-time sentiment:", data);
            setArraySentiment((prev) => {
                const updatedSentiments = [...prev, data.emotion_index];
                return updatedSentiments;
            });
        });

        socket.on("sentiment_complete", (data) => {
            console.log(data.message);
            setIsSentimentLoading(false);
            socket.disconnect();
        });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
            setIsSentimentLoading(false);
        });
    };

    return (
        <div>
            <button
                onClick={triggerRealTimeSentiment}
                style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "10px 15px",
                    cursor: "pointer",
                    marginBottom: "10px",
                }}
            >
                {isSentimentLoading ? "Analyzing Sentiments..." : "Analyze Sentiments in Real Time"}
            </button>

            <div className="edition-container">
                <div className="left-section">
                    <h3>Original Text ({languages.find((e) => e.code === sourceLang).name}):</h3>
                    <div className="original-text-container">
                        <ul>
                            {arraySourceText.map((sentence, index) => (
                                <li
                                    key={index}
                                    style={{
                                        backgroundColor: highlightedIndex === index ? "yellow" : "transparent",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onMouseLeave={() => setHighlightedIndex(null)}
                                >
                                    <strong>{`[Emotion: ${arraySentiment[index] ? emotions[sourceLang][arraySentiment[index]]: "None"}]: `}</strong>
                                    {sentence.split(" ").map((word, wordIndex) => (
                                        <span
                                            key={wordIndex}
                                            onClick={() => handleClick(word)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {word}
                                            {wordIndex < sentence.split(" ").length - 1 ? " " : ""}
                                        </span>
                                    ))}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="right-section">
                    <h3>Translated Text ({languages.find((e) => e.code === targetLang).name}):</h3>
                    <div className="translated-text-content">
                        <ul>
                            {arrayTranalatedText.map((text, index) => (
                                <li
                                    key={index}
                                    style={{
                                        backgroundColor: highlightedIndex === index ? "yellow" : "transparent",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onMouseLeave={() => setHighlightedIndex(null)}
                                >
                                    <strong>{`[Emotion: ${arraySentiment[index] ? emotions[targetLang][arraySentiment[index]]: "None"}]: `}</strong>
                                    {text}{" "}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {clickedWord && (
                    <div className="definitions-container">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3>"{clickedWord}":</h3>
                            <button
                                onClick={() => setClickedWord("")}
                                style={{
                                    backgroundColor: "#FF4D4D",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                X
                            </button>
                        </div>
                        <p style={{ fontStyle: "italic" }}>
                            <strong>Definition:</strong> {dictionary.definition}
                        </p>
                        <p><strong>Translations:</strong></p>
                        <ul>
                            {dictionary.translation?.map((definition, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleDefinitionSelect(definition)}
                                    style={{
                                        cursor: "pointer",
                                        padding: "5px",
                                        backgroundColor: selectedDefinition === definition ? "#007bff" : "transparent",
                                        color: selectedDefinition === definition ? "white" : "black",
                                        borderRadius: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    {definition}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={editDefinition}
                            style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "10px 15px",
                                cursor: "pointer",
                                marginTop: "10px",
                            }}
                        >
                            Save Definition
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Edition;