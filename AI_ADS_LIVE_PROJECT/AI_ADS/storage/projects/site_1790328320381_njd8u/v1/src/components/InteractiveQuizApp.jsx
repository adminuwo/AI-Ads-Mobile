import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function InteractiveQuizApp({ section }) {
  const questions = section.questions || [
    { id: 1, text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
    { id: 2, text: 'What gas do plants absorb from the air during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], answer: 'Carbon Dioxide' },
    { id: 3, text: 'What state of matter is water vapor?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 'Gas' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleSelect = (opt) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    if (opt === questions[currentIdx].answer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setCompleted(false);
  };

  const currentQ = questions[currentIdx];

  return (
    <section className="section-block quiz-section p-6 rounded-3xl max-w-xl mx-auto" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <h2 className="text-xl font-extrabold text-center mb-4 flex items-center justify-center gap-2" style={{ color: 'var(--text-color)' }}>
        <HelpCircle className="w-5 h-5 text-brand-400" /> {section.title || 'Science Mini Quiz'}
      </h2>

      {!completed ? (
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>

          <h3 className="text-sm font-extrabold text-white bg-slate-900 p-4 rounded-2xl border border-slate-800">{currentQ.text}</h3>

          <div className="space-y-2">
            {currentQ.options.map((opt, i) => {
              const isChosen = selectedOption === opt;
              const isCorrect = opt === currentQ.answer;
              let btnStyle = 'bg-slate-900 border-slate-800 text-white hover:border-slate-700';

              if (selectedOption !== null) {
                if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-extrabold';
                else if (isChosen) btnStyle = 'bg-red-500/20 border-red-500/50 text-red-300';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {selectedOption !== null && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <button onClick={nextQuestion} className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-extrabold text-xs">
              {currentIdx + 1 < questions.length ? 'Next Question →' : 'See Final Score 🏆'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <h3 className="text-2xl font-extrabold text-yellow-400">Quiz Completed! 🎉</h3>
          <p className="text-sm text-slate-300">You scored <strong>{score}</strong> out of <strong>{questions.length}</strong> correct!</p>
          <button onClick={restartQuiz} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center gap-1.5 mx-auto">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
    </section>
  );
}
