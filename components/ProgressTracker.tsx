import React, { useState, useMemo } from 'react';
import { useLanguage, ProgressData, Goal } from '../types';

interface ProgressTrackerProps {
    progressData: ProgressData;
    onSetSoberStartDate: (date: string) => void;
    onAddGoal: (text: string) => void;
    onToggleGoal: (id: string) => void;
    onDeleteGoal: (id: string) => void;
    onDailyCheckin: (mood: number, craving: number) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
    progressData,
    onSetSoberStartDate,
    onAddGoal,
    onToggleGoal,
    onDeleteGoal,
    onDailyCheckin,
}) => {
    const { t } = useLanguage();
    const [newGoalText, setNewGoalText] = useState('');
    const [mood, setMood] = useState(5);
    const [craving, setCraving] = useState(5);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const soberDays = useMemo(() => {
        if (!progressData.soberStartDate) return 0;
        const startDate = new Date(progressData.soberStartDate);
        const today = new Date();
        const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    }, [progressData.soberStartDate]);

    const todayString = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = progressData.dailyCheckins.some(c => c.date === todayString);

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim()) {
            onAddGoal(newGoalText.trim());
            setNewGoalText('');
        }
    };

    const handleCheckinSubmit = () => {
        onDailyCheckin(mood, craving);
    };
    
    const handleSetDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSetSoberStartDate(e.target.value);
        setShowDatePicker(false);
    }
    
    const completedGoalsCount = progressData.goals.filter(g => g.completed).length;

    const milestones = [
        { key: '1_day', text: t('progressTracker.milestones.1_day'), icon: '🌟', achieved: soberDays >= 1 },
        { key: '3_days', text: t('progressTracker.milestones.3_days'), icon: '✨', achieved: soberDays >= 3 },
        { key: '7_days', text: t('progressTracker.milestones.7_days'), icon: '🏆', achieved: soberDays >= 7 },
        { key: '14_days', text: t('progressTracker.milestones.14_days'), icon: '🏅', achieved: soberDays >= 14 },
        { key: '30_days', text: t('progressTracker.milestones.30_days'), icon: '💎', achieved: soberDays >= 30 },
        { key: '10_goals', text: t('progressTracker.milestones.10_goals'), icon: '🎯', achieved: completedGoalsCount >= 10 },
        { key: '25_goals', text: t('progressTracker.milestones.25_goals'), icon: '🚀', achieved: completedGoalsCount >= 25 },
    ];

    const Card: React.FC<{title: string, children: React.ReactNode, icon?: React.ReactNode}> = ({ title, children, icon }) => (
        <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg backdrop-blur-sm border border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                {icon && <span className="mr-3 rtl:ml-3 rtl:mr-0">{icon}</span>}
                {title}
            </h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
    
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">{t('progressTracker.title')}</h2>
                <p className="mt-2 text-gray-400 max-w-2xl mx-auto">{t('progressTracker.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Counter and Check-in */}
                <div className="lg:col-span-1 space-y-8 lg:sticky top-28">
                    <Card title={t('progressTracker.soberDays')}>
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                                    <circle className="text-slate-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                                    <circle className="text-blue-400" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" strokeDasharray="283" strokeDashoffset={progressData.soberStartDate ? "0" : "283"} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}/>
                                </svg>
                                <span className="text-6xl font-extrabold text-white">{soberDays}</span>
                            </div>
                            
                            {!progressData.soberStartDate || showDatePicker ? (
                                <div className="mt-4">
                                    <label htmlFor="start-date" className="block text-sm text-gray-400 mb-2">{t('progressTracker.setStartDate')}</label>
                                    <input 
                                        type="date" 
                                        id="start-date"
                                        onChange={handleSetDate}
                                        className="bg-slate-900 border-slate-600 rounded-md py-2 px-3 text-white text-sm"
                                        max={todayString}
                                    />
                                </div>
                            ) : (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-400">{t('progressTracker.startDateSet')} {new Date(progressData.soberStartDate).toLocaleDateString()}</p>
                                    <button onClick={() => setShowDatePicker(true)} className="text-xs text-blue-400 hover:underline">{t('progressTracker.edit')}</button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title={t('progressTracker.dailyCheckinTitle')}>
                        {hasCheckedInToday ? (
                            <div className="text-center py-4">
                                <p className="text-green-400 font-semibold">{t('progressTracker.checkinComplete')}</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('progressTracker.moodLabel')}: {mood}</label>
                                    <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('progressTracker.cravingLabel')}: {craving}</label>
                                    <input type="range" min="1" max="10" value={craving} onChange={e => setCraving(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400" />
                                </div>
                                <button onClick={handleCheckinSubmit} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors">{t('progressTracker.submitCheckin')}</button>
                            </>
                        )}
                    </Card>
                </div>

                {/* Right Column: Goals and Rewards */}
                <div className="lg:col-span-2 space-y-8">
                     <Card title={t('progressTracker.goalsTitle')}>
                        <form onSubmit={handleAddGoal} className="flex gap-2">
                            <input
                                type="text"
                                value={newGoalText}
                                onChange={e => setNewGoalText(e.target.value)}
                                placeholder={t('progressTracker.addGoalPlaceholder')}
                                className="flex-grow bg-slate-700 border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                            />
                            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors">{t('progressTracker.addGoalButton')}</button>
                        </form>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {progressData.goals.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">{t('progressTracker.addGoalPlaceholder')}</p>
                            ) : progressData.goals.map(goal => (
                                <div key={goal.id} className={`flex items-center p-3 rounded-md transition-colors ${goal.completed ? 'bg-green-900/30' : 'bg-slate-700/50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={goal.completed}
                                        onChange={() => onToggleGoal(goal.id)}
                                        className="h-5 w-5 rounded border-gray-500 text-blue-500 focus:ring-blue-600 bg-slate-800"
                                    />
                                    <span className={`flex-grow mx-3 rtl:mx-3 ${goal.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{goal.text}</span>
                                    <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-500 hover:text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title={t('progressTracker.rewardsTitle')}>
                        <div className="text-center bg-slate-900/50 p-4 rounded-lg">
                             <p className="text-lg text-gray-400">{t('progressTracker.totalPoints')}</p>
                             <p className="text-4xl font-bold text-yellow-300">{progressData.points.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {milestones.map(m => (
                                <div key={m.key} className={`p-3 rounded-md flex items-center gap-3 transition-all duration-300 ${m.achieved ? 'bg-yellow-800/50 border border-yellow-600/50' : 'bg-slate-700/50'}`}>
                                    <span className={`text-2xl ${m.achieved ? '' : 'opacity-30'}`}>{m.icon}</span>
                                    <span className={`font-semibold ${m.achieved ? 'text-yellow-300' : 'text-gray-400'}`}>{m.text}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default ProgressTracker;