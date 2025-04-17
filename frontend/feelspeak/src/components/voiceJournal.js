import React, { useState } from 'react';

const VoiceJournal = () => {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const audioChunks = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings((prev) => [...prev, audioUrl]);

        // Optionally, upload the audioBlob to the backend
        uploadRecording(audioBlob);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecording(false);
    }
  };

  const uploadRecording = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://localhost:5000/uploadRecording', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);
    } catch (err) {
      console.error('Error uploading recording:', err);
    }
  };

  return (
    <div>
      <h1>Voice Journal</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <h2>Recordings</h2>
      <ul>
        {recordings.map((url, index) => (
          <li key={index}>
            <audio controls src={url}></audio>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoiceJournal;