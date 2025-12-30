import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Leaf, Wind, Building2, AlertTriangle, Zap, Car, CheckCircle2 } from 'lucide-react';

// PLACEHOLDER API KEY - User will provide this
const API_KEY = "AIzaSyAHMeacYpDcOFxOuo78sNCa-alPNgtww1c";

export function PollutionInsights({ wardName }) {
    const [loading, setLoading] = useState(false);
    const [wardStats, setWardStats] = useState(null);
    const [insights, setInsights] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [apiKey, setApiKey] = useState(API_KEY);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);

    // Load CSV once
    useEffect(() => {
        fetch('/delhi_wards_final.csv')
            .then(r => r.text())
            .then(text => {
                const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                setCsvData(result.data);
            });
    }, []);

    // Trigger Analysis when Ward Changes
    useEffect(() => {
        if (!wardName || csvData.length === 0) {
            setInsights(null);
            setWardStats(null);
            return;
        }

        // Normalize matching
        const normalize = (str) => str ? str.toString().toLowerCase().trim().replace(/\s+/g, ' ') : '';
        const target = normalize(wardName);
        
        // Try exact match first, then partial
        let found = csvData.find(w => normalize(w.WardName) === target);

        if (!found) {
             console.warn("Ward not found in CSV:", wardName);
             return;
        }

        setWardStats(found);
        generateInsights(found);

    }, [wardName, csvData]);

    const generateInsights = async (data) => {
        if (!apiKey || apiKey.includes("PUT_YOUR_KEY")) return;

        setLoading(true);
        setError(null);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `
You are an air pollution control expert working for the government. 
Analyze the following data for the Ward: **${data.WardName}**.

Data:
- Total Population: ${data.TotalPop}
- Area: ${data.Area_sq_km} sq km
- Population Density: ${data.Pop_density}
- Ventilation Quality Index: ${data.Ventilation_quality}
- Greenery Cover: ${data.percent_land_cover_in_greenery}%
- Water Bodies: ${data.percent_land_cover_in_water_bodies}%
- Built-up Area: ${data.percent_land_cover_in_buildings}%
- Informal Growth: ${data.percent_land_with_informal_growth_signature}%
- Unplanned Ratio Index: ${data.planned_to_unplanned_ratio_index}
- Major Roads Density: ${data.major_roads_highways_density_index}

Task:
1. Provide 5 personalized insights/points for this area regarding its pollution susceptibility.
2. Suggest actionable strategies to control air pollution.
   For each strategy provide: Target Emission Sector, Action Title, Description, Recommendation Score (0-100), Ease of Doing (Easy/Medium/Hard), Time Span (Short/Long term).

Output Format (strict JSON):
{
  "points": ["point 1", "point 2", ...],
  "strategies": [
    {
      "sector": "Transport/Industry/etc",
      "title": "Action Title",
      "description": "Short description",
      "score": 95,
      "ease": "Medium",
      "time": "Long Term"
    }
  ]
}
`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            
            // Cleanup JSON markdown if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleanText);
            
            setInsights(json);

        } catch (err) {
            console.error("Gemini Error:", err);
            setError("Failed to generate AI insights. Please check API Key.");
        } finally {
            setLoading(false);
        }
    };

    if (!wardName) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
            <div className="text-center">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a ward on the map to generate AI insights</p>
            </div>
        </div>
    );
    
    if (!wardStats && csvData.length > 0) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
            Data not found for ward: {wardName}
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen p-8 md:p-12 lg:p-16">
            <div className="max-w-6xl mx-auto">
                
                {/* Hero Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200">
                        <SparklesIcon className="w-4 h-4" />
                        AI Analysis Report
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 items-center gap-3">
                        Pollution Control Strategy: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{wardName}</span>
                    </h2>
                    <p className="text-xl text-slate-500 font-light max-w-2xl">
                        A hyper-localized action plan generated based on demographic data, urban density, and environmental metrics.
                    </p>
                </div>

                {/* API Key Input (Temporary for User) */}
                {(!apiKey || apiKey.includes("PUT_YOUR_KEY")) && (
                    <div className="bg-white border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm mb-12 flex gap-6 items-start max-w-3xl">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={24} />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Gemini API Key Required</h3>
                            <p className="text-slate-500 mb-4">To generate live insights, please provide a valid Google Gemini API Key.</p>
                            <input 
                                type="text" 
                                placeholder="Paste AIza... key here"
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    if(wardStats && e.target.value.length > 20) generateInsights(wardStats);
                                }}
                            />
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="space-y-8 animate-pulse opacity-50">
                        <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="h-48 bg-slate-200 rounded-3xl"></div>
                            <div className="h-48 bg-slate-200 rounded-3xl"></div>
                        </div>
                    </div>
                )}

                {!loading && insights && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        {/* Top Row: Vulnerability & Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Vulnerability Card */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <AlertTriangle size={20} />
                                    </div>
                                    Critical Vulnerability Factors
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {insights.points.map((p, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-orange-50/50 hover:border-orange-100 transition-colors">
                                            <div className="min-w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                                            <span className="text-slate-600 font-medium text-sm leading-relaxed">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Stats Card */}
                            {wardStats && (
                                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                                        <Building2 size={20} className="text-blue-400" />
                                        Urban Metrics
                                    </h3>
                                    <div className="space-y-6 relative z-10">
                                        <StatRow label="Green Cover" value={`${wardStats.percent_land_cover_in_greenery}%`} icon={<Leaf size={16} />} color="text-green-400" />
                                        <StatRow label="Built Density" value={`${wardStats.percent_land_cover_in_buildings}%`} icon={<Building2 size={16} />} color="text-orange-400" />
                                        <StatRow label="Ventilation Idx" value={Number(wardStats.Ventilation_quality).toFixed(2)} icon={<Wind size={16} />} color="text-blue-400" />
                                        <StatRow label="Road Density" value={wardStats.major_roads_highways_density_index} icon={<Car size={16} />} color="text-red-400" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Strategies Section */}
                        <div>
                             <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-slate-800">Strategic Interventions</h3>
                                <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{insights.strategies.length} Actions Proposed</span>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {insights.strategies.map((strategy, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-blue-100 transition-all flex flex-col justify-between group">
                                        
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-3 py-1 rounded-full text-[11px] uppercase font-bold tracking-wider ${
                                                    getSectorColor(strategy.sector)
                                                }`}>
                                                    {strategy.sector}
                                                </span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl font-black text-slate-800">{strategy.score}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact</span>
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{strategy.title}</h4>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-6">{strategy.description}</p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                                <Zap size={14} className={strategy.ease === 'Easy' ? 'text-green-500' : 'text-orange-500'} />
                                                {strategy.ease} to Execute
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                <CheckCircle2 size={14} />
                                                {strategy.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

function StatRow({ label, value, icon, color }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className={`flex items-center gap-3 text-sm font-medium ${color}`}>
                {icon}
                <span className="text-slate-300">{label}</span>
            </div>
            <span className="text-lg font-bold font-mono tracking-tight">{value}</span>
        </div>
    );
}

function SparklesIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
            <path d="M16.096 3.666a.75.75 0 0 1 .64.062l5.053 3.32a.75.75 0 0 1 .116 1.155l-4.225 4.908a.75.75 0 0 1-1.002.124l-3.37-2.464-3.518 4.221a.75.75 0 0 1-1.12-.047l-2.73-3.23a.75.75 0 0 1-.03-1.02l4.873-5.592a.75.75 0 0 1 1.05-.078l2.972 2.378 2.366-2.61a.75.75 0 0 1 .925-.127ZM3.75 14.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Z" />
        </svg>
    )
}

function getSectorColor(sector) {
    const s = sector.toLowerCase();
    if (s.includes('transport')) return 'bg-orange-100 text-orange-600';
    if (s.includes('energy') || s.includes('electricity')) return 'bg-yellow-100 text-yellow-600';
    if (s.includes('forest') || s.includes('green')) return 'bg-green-100 text-green-600';
    if (s.includes('industry')) return 'bg-purple-100 text-purple-600';
    return 'bg-blue-100 text-blue-600';
}
