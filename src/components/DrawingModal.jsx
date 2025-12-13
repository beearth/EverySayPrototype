import { useState, useRef, useEffect } from "react";
import { addToStack } from "../components/MyStackFeed";
import { analyzeDrawing } from "../lib/ai";
import { Loader2, Sparkles, CheckCircle2, XCircle } from "lucide-react";

const DRAWING_WORDS = [
    { id: "love", word: "Love", color: "#ec4899" }, // Pink
    { id: "hope", word: "Hope", color: "#10b981" }, // Emerald
    { id: "peace", word: "Peace", color: "#3b82f6" }, // Blue
    { id: "joy", word: "Joy", color: "#f97316" }, // Orange
    { id: "luck", word: "Luck", color: "#8b5cf6" }, // Purple
];

export default function DrawingModal({ open, onClose, onStackComplete }) {
    const canvasRef = useRef(null);
    const [selectedWord, setSelectedWord] = useState(DRAWING_WORDS[0]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [ctx, setCtx] = useState(null);

    // AI Check State
    const [isChecking, setIsChecking] = useState(false);
    const [aiFeedback, setAiFeedback] = useState(null);

    // Initialize canvas
    useEffect(() => {
        if (open && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // Set canvas size to match display size
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            // Basic styling
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineWidth = 4;
            context.strokeStyle = selectedWord.color;

            setCtx(context);
        }
    }, [open]);

    // Update stroke color when word changes
    useEffect(() => {
        if (ctx) {
            ctx.strokeStyle = selectedWord.color;
            setAiFeedback(null); // Reset feedback on word change
        }
    }, [selectedWord, ctx]);

    const startDrawing = (e) => {
        if (!ctx) return;
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !ctx) return;
        e.preventDefault(); // Prevent scrolling on touch
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (ctx) {
            ctx.closePath();
        }
        setIsDrawing(false);
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const clearCanvas = () => {
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setAiFeedback(null);
        }
    };

    const handleAICheck = async () => {
        if (!canvasRef.current || isChecking) return;
        setIsChecking(true);
        setAiFeedback(null);

        try {
            const dataUrl = canvasRef.current.toDataURL("image/png");
            const result = await analyzeDrawing(dataUrl, selectedWord.word);
            setAiFeedback(result);
        } catch (err) {
            console.error("AI Check failed", err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleStack = async () => {
        if (!canvasRef.current || saving) return;
        setSaving(true);

        try {
            // Get image data from canvas
            const dataUrl = canvasRef.current.toDataURL("image/png");
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `drawing-${selectedWord.id}-${Date.now()}.png`, { type: "image/png" });

            await addToStack(file, {
                preset: "drawing",
                script: `Positive Drawing: ${selectedWord.word}`,
                duration: 0,
                timestamp: Date.now(),
                type: "drawing",
                itemId: `drawing-${selectedWord.id}`,
                note: `Generated via Drawing Mode (${selectedWord.word})`,
            });

            onStackComplete?.();
            onClose();
            // Optional: Show success toast
        } catch (err) {
            console.error("Failed to save drawing:", err);
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1220] p-6 shadow-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        🎨 Positive Drawing
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-3 py-1 text-sm border border-white/20 hover:bg-white/10"
                    >
                        Close
                    </button>
                </div>

                <p className="text-sm text-neutral-400 mb-4">
                    Draw your positive energy related to the word.
                    <br />
                    Selected: <span style={{ color: selectedWord.color }} className="font-bold">{selectedWord.word}</span>
                </p>

                {/* AI Feedback Overlay */}
                {aiFeedback && (
                    <div className={`mb-4 p-3 rounded-xl border flex items-start gap-3 ${aiFeedback.isMatch
                            ? "bg-green-500/10 border-green-500/20 text-green-200"
                            : "bg-red-500/10 border-red-500/20 text-red-200"
                        }`}>
                        {aiFeedback.isMatch ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                        <div>
                            <div className="font-semibold text-sm">{aiFeedback.isMatch ? "Great Job!" : "Not quite..."}</div>
                            <div className="text-xs opacity-90">{aiFeedback.feedback}</div>
                        </div>
                    </div>
                )}

                {/* Word Selection */}
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {DRAWING_WORDS.map((w) => (
                        <button
                            key={w.id}
                            onClick={() => setSelectedWord(w)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedWord.id === w.id
                                ? "bg-white/10 border-white/40 ring-1 ring-white/20"
                                : "border-transparent bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
                                }`}
                        >
                            <span
                                className="w-2 h-2 rounded-full inline-block mr-2"
                                style={{ backgroundColor: w.color }}
                            />
                            {w.word}
                        </button>
                    ))}
                </div>

                {/* Canvas */}
                <div className="flex-1 relative min-h-[300px] border rounded-xl overflow-hidden bg-neutral-900 touch-none">
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />

                    {/* Instructions Overlay (fades out on interaction usually, but static for now is fine) */}
                    {!isDrawing && !ctx && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-600">
                            Start drawing here...
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={clearCanvas}
                        className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 font-medium"
                    >
                        Clear
                    </button>

                    <button
                        onClick={handleAICheck}
                        disabled={isChecking || saving}
                        className="px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-2"
                    >
                        {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isChecking ? "Checking..." : "AI Quiz Check"}
                    </button>
                    <button
                        onClick={handleStack}
                        disabled={saving}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? "Stacking..." : "Stack My Drawing 🧱"}
                    </button>
                </div>
            </div>
        </div>
    );
}
