import React from "react";
import languages from "../assets/languages.json";

function Translation({  translatedText, inputText, sourceLang, targetLang }) {

    return (<><div>
                <h2>Translation Mode</h2>
                <div>
                    <label>
                        Source Language:
                        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
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
                        Target Language:
                        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <textarea
                    rows="5"
                    cols="50"
                    placeholder="Enter text to translate..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                ></textarea>
                <br />
                <button onClick={handleTranslate}>Translate</button>
                <h2>Translated Text:</h2>
                <p>{translatedText}</p>
            </div></>)
}

export default Translation;