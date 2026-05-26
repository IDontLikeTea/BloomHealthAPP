'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, ChevronLeft, Sparkles, Target, Activity, User, Loader2, TrendingDown, TrendingUp, Dumbbell, Scale, Zap, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

const GOAL_TYPES: { id: string; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'weight_loss', label: 'Weight Loss', icon: TrendingDown, description: 'Lose weight at a sustainable, healthy pace' },
  { id: 'weight_gain', label: 'Weight Gain', icon: TrendingUp, description: 'Increase weight in a balanced way' },
  { id: 'muscle_building', label: 'Build Strength', icon: Dumbbell, description: 'Focus on building lean muscle' },
  { id: 'maintenance', label: 'Maintain Weight', icon: Scale, description: 'Keep your current weight stable' },
  { id: 'wellness', label: 'General Wellness', icon: Zap, description: 'Focus on overall health and energy' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Mostly Sitting', description: 'Desk job, little exercise' },
  { id: 'light', label: 'Lightly Active', description: 'Light walks, casual movement' },
  { id: 'moderate', label: 'Moderately Active', description: 'Regular exercise 3-4x/week' },
  { id: 'active', label: 'Very Active', description: 'Intense exercise 5-6x/week' },
  { id: 'very_active', label: 'Super Active', description: 'Athlete or physical job' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companionName: 'Bloom',
    height: '',
    heightFt: '',
    heightIn: '',
    weight: '',
    age: '',
    gender: 'female',
    goalType: 'wellness',
    activityLevel: 'moderate',
    useMetric: true,
  });

  const steps = [
    { title: 'Meet Your Companion', icon: Heart },
    { title: 'About You', icon: User },
    { title: 'Your Goal', icon: Target },
    { title: 'Activity Level', icon: Activity },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert imperial to metric if needed
      let heightCm = parseFloat(formData.height);
      let weightKg = parseFloat(formData.weight);
      
      if (!formData.useMetric) {
        // Convert feet/inches to cm
        const ft = parseFloat(formData.heightFt) || 0;
        const inches = parseFloat(formData.heightIn) || 0;
        heightCm = (ft * 12 + inches) * 2.54;
        
        // Convert lbs to kg
        weightKg = parseFloat(formData.weight) / 2.205;
      }
      
      const submitData = {
        ...formData,
        height: heightCm.toString(),
        weight: weightKg.toString(),
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      toast.success(`${formData.companionName} is ready to help you on your journey!`);
      router.replace('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0:
        return formData.companionName.trim().length > 0;
      case 1:
        if (formData.useMetric) {
          return formData.height && formData.weight && formData.age;
        } else {
          return (formData.heightFt || formData.heightIn) && formData.weight && formData.age;
        }
      case 2:
        return formData.goalType;
      case 3:
        return formData.activityLevel;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute rounded-full opacity-30 w-40 h-40 bg-gray-200 -top-20 -right-20"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute rounded-full opacity-30 w-32 h-32 bg-gray-200 bottom-20 -left-10"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="max-w-2xl mx-auto pt-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                i === step
                  ? 'bg-emerald-600 text-white scale-110'
                  : i < step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <s.icon className="w-5 h-5" />
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-8"
          >
            {/* Step 0: Companion Name */}
            {step === 0 && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Heart className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Name Your AI Companion</h2>
                <p className="text-gray-500 mb-8">
                  Your companion will support you with kindness and encouragement throughout your journey.
                </p>
                <input
                  type="text"
                  value={formData.companionName}
                  onChange={(e) => setFormData({ ...formData, companionName: e.target.value })}
                  placeholder="Give your companion a name"
                  className="input-field max-w-xs mx-auto text-center text-lg"
                  maxLength={20}
                />
                <p className="text-sm text-gray-400 mt-3">
                  You can always change this later
                </p>
              </div>
            )}

            {/* Step 1: About You */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">Tell us about yourself</h2>
                <p className="text-gray-500 text-center mb-6">
                  This helps us personalize your calorie and nutrition goals
                </p>
                
                {/* Unit Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex bg-gray-50 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, useMetric: true })}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.useMetric
                          ? 'bg-emerald-600 text-white'
                          : 'text-emerald-600 hover:bg-gray-100'
                      }`}
                    >
                      Metric (cm/kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, useMetric: false })}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        !formData.useMetric
                          ? 'bg-emerald-600 text-white'
                          : 'text-emerald-600 hover:bg-gray-100'
                      }`}
                    >
                      Imperial (ft/lbs)
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 max-w-sm mx-auto">
                  {/* Height Input */}
                  {formData.useMetric ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="165"
                        className="input-field"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Height</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.heightFt}
                            onChange={(e) => setFormData({ ...formData, heightFt: e.target.value })}
                            placeholder="5"
                            className="input-field pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ft</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.heightIn}
                            onChange={(e) => setFormData({ ...formData, heightIn: e.target.value })}
                            placeholder="6"
                            className="input-field pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">in</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weight Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Weight ({formData.useMetric ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder={formData.useMetric ? '60' : '132'}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="25"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Gender</label>
                    <div className="flex gap-3">
                      {['female', 'male', 'other'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                            formData.gender === g
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-50 text-emerald-600 hover:bg-gray-100'
                          }`}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Goal */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">What brings you here?</h2>
                <p className="text-gray-500 text-center mb-8">
                  All journeys are valid—choose what feels right for you
                </p>
                <div className="grid gap-3">
                  {GOAL_TYPES.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, goalType: goal.id })}
                      className={`p-4 rounded-xl text-left transition-all ${
                        formData.goalType === goal.id
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          formData.goalType === goal.id
                            ? 'bg-white/20'
                            : 'bg-gray-200'
                        }`}>
                          <goal.icon className={`w-5 h-5 ${formData.goalType === goal.id ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="font-semibold">{goal.label}</div>
                          <div className={`text-sm ${formData.goalType === goal.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {goal.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Activity Level */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">How active are you?</h2>
                <p className="text-gray-500 text-center mb-8">
                  This helps calculate your daily calorie needs
                </p>
                <div className="grid gap-3">
                  {ACTIVITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                      className={`p-4 rounded-xl text-left transition-all ${
                        formData.activityLevel === level.id
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold">{level.label}</div>
                      <div className={`text-sm ${formData.activityLevel === level.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {level.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  step === 0 ? 'invisible' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step === steps.length - 1 ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Let's Begin
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
