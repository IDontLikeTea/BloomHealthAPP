'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Sparkles, Loader2, Check, Edit2, X, Coffee, Salad, UtensilsCrossed, Cookie } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', Icon: Coffee },
  { id: 'lunch', label: 'Lunch', Icon: Salad },
  { id: 'dinner', label: 'Dinner', Icon: UtensilsCrossed },
  { id: 'snack', label: 'Snack', Icon: Cookie },
];

interface AnalysisResult {
  foods: string[];
  calories: { min: number; max: number; estimate: number };
  protein: number;
  carbs: number;
  fat: number;
  positiveNote: string;
  gentleInsight: string;
}

export default function ScanMealPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mealType, setMealType] = useState('snack');
  const [editData, setEditData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/ai/analyze-meal', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      setAnalysis(data);
      setEditData({
        name: data?.foods?.join(', ') ?? 'Meal',
        calories: data?.calories?.estimate ?? 0,
        protein: data?.protein ?? 0,
        carbs: data?.carbs ?? 0,
        fat: data?.fat ?? 0,
      });
    } catch (error) {
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          mealType,
          calories: editData.calories,
          protein: editData.protein,
          carbs: editData.carbs,
          fat: editData.fat,
          isAIGenerated: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success('Meal logged successfully!');
      // Use hard navigation to bypass Next.js router cache and get fresh server data
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to save meal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            AI Meal Scanner
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-28 lg:pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {/* Image Upload Area */}
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-gray-100/50 transition-all"
            >
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Snap or Upload Your Meal</h2>
              <p className="text-gray-500 text-sm mb-4">
                Our AI will analyze it and estimate calories & macros
              </p>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="btn-secondary"
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Choose Photo
              </button>
            </div>
          ) : (
            <div>
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden mb-4">
                <img
                  src={imagePreview}
                  alt="Meal preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setAnalysis(null);
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Analyze Button */}
              {!analysis && (
                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Meal
                    </>
                  )}
                </button>
              )}

              {/* Analysis Results */}
              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    {/* AI Insight */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-emerald-800 text-sm">
                        {analysis?.positiveNote ?? 'Great choice!'}
                      </p>
                    </div>

                    {/* Meal Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Meal Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {MEAL_TYPES.map((type) => {
                          const Icon = type.Icon;
                          const active = mealType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setMealType(type.id)}
                              className={`p-2 rounded-xl text-center transition-all text-sm flex flex-col items-center gap-1 ${
                                active
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                              <span className="text-xs">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detected Foods */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-600">Detected Foods</label>
                        <button
                          onClick={() => setEditing(!editing)}
                          className="text-sm text-emerald-600 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          {editing ? 'Done' : 'Edit'}
                        </button>
                      </div>
                      {editing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-700">{editData.name}</p>
                      )}
                    </div>

                    {/* Nutrition */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-emerald-600">
                          {editing ? (
                            <input
                              type="number"
                              value={editData.calories}
                              onChange={(e) => setEditData({ ...editData, calories: parseInt(e.target.value) || 0 })}
                              className="w-20 text-center bg-white rounded-lg px-2 py-1"
                            />
                          ) : (
                            editData.calories
                          )}
                        </p>
                        <p className="text-sm text-emerald-600">Calories</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                          <span className="text-sm text-gray-600">Protein</span>
                          {editing ? (
                            <input
                              type="number"
                              value={editData.protein}
                              onChange={(e) => setEditData({ ...editData, protein: parseFloat(e.target.value) || 0 })}
                              className="w-16 text-right bg-gray-50 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <span className="font-medium">{editData.protein}g</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                          <span className="text-sm text-gray-600">Carbs</span>
                          {editing ? (
                            <input
                              type="number"
                              value={editData.carbs}
                              onChange={(e) => setEditData({ ...editData, carbs: parseFloat(e.target.value) || 0 })}
                              className="w-16 text-right bg-gray-50 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <span className="font-medium">{editData.carbs}g</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                          <span className="text-sm text-gray-600">Fat</span>
                          {editing ? (
                            <input
                              type="number"
                              value={editData.fat}
                              onChange={(e) => setEditData({ ...editData, fat: parseFloat(e.target.value) || 0 })}
                              className="w-16 text-right bg-gray-50 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <span className="font-medium">{editData.fat}g</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gentle Insight */}
                    {analysis?.gentleInsight && (
                      <p className="text-sm text-gray-500 italic text-center">
                        {analysis.gentleInsight}
                      </p>
                    )}

                    {/* Save Button */}
                    <button
                      onClick={saveMeal}
                      disabled={saving}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Log This Meal
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
        </motion.div>
      </main>
    </div>
  );
}
