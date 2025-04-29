import React from "react";
import languages from "../assets/languages.json";

function Translation({inputText, sourceLang, targetLang, setInputs, handleTranslateStream }) {

    return (<><div id="translation">
                <div className="language-select-row">
                    <div>
                        <label>
                            From:
                            <select
                                value={sourceLang}
                                onChange={(e) => setInputs(e)}
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
                                onChange={(e) => setInputs(e)}
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
                    onChange={(e) => setInputs(e)}
                ></textarea>
                <br />
                <button onClick={handleTranslateStream}>Translate</button>
                <h3>Translations:</h3>
                <div className="translation-box">
                    <p>{arrayTranalatedText.join(" ")}</p>
                </div>
            </div></>)
}

export default Translation;