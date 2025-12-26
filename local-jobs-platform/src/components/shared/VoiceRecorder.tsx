import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/helpers';

interface VoiceRecorderProps {
  label?: string;
  maxDuration?: number; // in seconds
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
  onRecordingDelete?: () => void;
  existingAudioUrl?: string;
  helperText?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  label,
  maxDuration = 30,
  onRecordingComplete,
  onRecordingDelete,
  existingAudioUrl,
  helperText,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>(existingAudioUrl || '');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl && !existingAudioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, existingAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob, url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const deleteRecording = () => {
    if (audioUrl && !existingAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    if (onRecordingDelete) onRecordingDelete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `voice-intro-${Date.now()}.webm`;
      a.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="card">
        {!audioUrl ? (
          <div className="text-center py-6">
            {!isRecording ? (
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <Mic className="w-8 h-8 text-red-600" />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum {maxDuration} seconds
                </p>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 relative">
                  <Mic className={cn(
                    "w-10 h-10 text-red-600",
                    !isPaused && "animate-pulse"
                  )} />
                  {!isPaused && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  )}
                </div>

                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {formatTime(recordingTime)}
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={stopRecording}
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                </div>

                <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={togglePlayPause}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Voice Recording ({formatTime(recordingTime)})
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary-600 h-full w-full"></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadRecording}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={deleteRecording}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {helperText && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

