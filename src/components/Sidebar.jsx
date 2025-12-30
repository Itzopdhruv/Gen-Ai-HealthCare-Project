import React, { useState, useEffect } from 'react';
import {
    Home,
    Map as MapIcon,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Cpu,
    Menu,
    Settings,
    Users,
    Activity,
    Database,
    Share2,
    FileOutput,
    TestTube,
    Plus,
    X,
    LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';

// Custom CSS for scrollbar
const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #a3a3a3; border-radius: 4px; }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #737373; }
`;

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedLot, setExpandedLot] = useState(null);
    const [followedWards, setFollowedWards] = useState([]);
    const [allWards, setAllWards] = useState([]); // Master list from CSV
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedWardToAdd, setSelectedWardToAdd] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const currentPath = location.pathname;

    // Fetch master ward list and user's followed wards
    useEffect(() => {
        // Load All Wards
        fetch('/delhi_wards_final.csv')
            .then(r => r.text())
            .then(text => {
                const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                // @ts-ignore
                const names = result.data.map(d => d.WardName).filter(Boolean).sort();
                setAllWards(names);
            });

        // Load Followed Wards
        fetchFollowedWards();
    }, []);

    const fetchFollowedWards = async () => {
        try {
            const res = await fetch('http://localhost:3000/get-wards', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setFollowedWards(data.wards);
                // Expand first if available and nothing expanded
                if (data.wards.length > 0 && !expandedLot) {
                    setExpandedLot(data.wards[0]);
                }
            }
        } catch (e) {
            console.error("Failed to fetch wards", e);
        }
    };

    const handleAddWard = async () => {
        if (!selectedWardToAdd) return;
        try {
            const res = await fetch('http://localhost:3000/add-ward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wardName: selectedWardToAdd }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                await fetchFollowedWards();
                setIsAddModalOpen(false);
                setSelectedWardToAdd('');
                // Auto expand the new one
                setExpandedLot(selectedWardToAdd);
            }
        } catch (e) {
            alert('Failed to add ward');
        }
    };

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    const handleMouseEnter = () => setIsSidebarOpen(true);
    const handleMouseLeave = () => {
        setIsSidebarOpen(false);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLotClick = (lotName) => {
        if (!isSidebarOpen) {
            setIsSidebarOpen(true);
            setExpandedLot(lotName);
        } else {
            setExpandedLot(expandedLot === lotName ? null : lotName);
        }
    };

    const wardSubItems = [
        { label: 'Overview', path: 'overview', icon: <LayoutDashboard size={16} /> },
        { label: 'Decision Support', path: 'decision-support', icon: <Activity size={16} /> },
        { label: 'Simulator', path: 'simulator', icon: <Cpu size={16} /> },
        { label: 'External Contributors', path: 'external-contributors', icon: <Users size={16} /> },
        { label: 'Sensor Management', path: 'sensor-management', icon: <Settings size={16} /> },
        { label: 'Public Release', path: 'public-release', icon: <Share2 size={16} /> },
        { label: 'Export PDF Report', path: 'export-report', icon: <FileOutput size={16} /> },
        { label: 'Meta Data', path: 'meta-data', icon: <Database size={16} /> },
    ];

    // Helper to slugify ward name safely
    const slugify = (text) => text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text

    return (
        <>
            <style>{scrollbarStyle}</style>
            
            {/* Add Ward Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Add New Ward</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Select a ward to follow and analyze.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Ward</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedWardToAdd}
                                    onChange={(e) => setSelectedWardToAdd(e.target.value)}
                                >
                                    <option value="">-- Choose Ward --</option>
                                    {allWards.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={handleAddWard}
                                disabled={!selectedWardToAdd}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Ward to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`
          relative flex flex-col bg-neutral-100 border-r border-neutral-300 shadow-sm
          transition-all duration-300 ease-in-out h-screen z-50
          ${isSidebarOpen ? 'w-72' : 'w-20'} 
        `}
            >
                {/* Header */}
                <div className={`flex items-center h-16 border-b border-neutral-300 ${isSidebarOpen ? 'px-5 justify-between' : 'justify-center'}`}>
                    {isSidebarOpen && (
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-fuchsia-700 bg-clip-text text-transparent tracking-tight leading-none mt-1">
                            SITUS&nbsp;
                        </span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={`p-2 rounded hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors ${!isSidebarOpen ? 'block' : 'hidden'}`}
                    >
                        <Menu size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
                    <div className="px-3 space-y-1">
                        <NavItem
                            icon={<Home size={18} />}
                            label="Home"
                            isOpen={isSidebarOpen}
                            active={currentPath === '/home' || currentPath === '/'}
                            onClick={() => navigate('/home')}
                        />
                        {/* Map & Analytics removed from top if user wants clean sidebar? Or keep as general map? User didn't say remove. */}
                        <NavItem
                            icon={<MapIcon size={18} />}
                            label="Map & Analytics"
                            isOpen={isSidebarOpen}
                            active={currentPath === '/map'}
                            onClick={() => navigate('/map')}
                        />
                    </div>

                    <div className="my-4 border-t border-neutral-300 mx-5"></div>

                    {/* Wards Section */}
                    <div className="px-3">
                        <div className={`flex items-center justify-between mb-3 px-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                             <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                Wards
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="p-1 hover:bg-neutral-200 rounded text-blue-600 hover:text-blue-800 transition-colors"
                                title="Add Ward"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Rendering Dynamic Followed Wards */}
                        {followedWards.map(wardName => (
                            <LotItem
                                key={wardName}
                                label={wardName}
                                slug={slugify(wardName)}
                                isOpen={isSidebarOpen}
                                isExpanded={expandedLot === wardName}
                                onToggle={() => handleLotClick(wardName)}
                                navigate={navigate}
                                currentPath={currentPath}
                                subItems={wardSubItems}
                            />
                        ))}
                        
                        {followedWards.length === 0 && isSidebarOpen && (
                            <div className="px-4 py-8 text-center" key="empty-state">
                                <p className="text-xs text-slate-400 mb-3">No wards selected yet.</p>
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="text-xs text-blue-600 font-bold hover:underline"
                                >
                                    + Add Your First Ward
                                </button>
                            </div>
                        )}
                        
                    </div>

                    <div className="my-4 border-t border-neutral-300 mx-5"></div>

                    {/* Tools */}
                    <div className="px-3 space-y-1">
                        <NavItem
                            icon={<Settings size={18} />}
                            label="Manage Wards"
                            isOpen={isSidebarOpen}
                            active={currentPath === '/manage-wards'}
                            onClick={() => navigate('/manage-wards')}
                        />
                        <NavItem
                            icon={<TestTube size={18} />}
                            label="Playground"
                            isOpen={isSidebarOpen}
                            active={currentPath === '/playground'}
                            onClick={() => navigate('/playground')}
                        />
                    </div>

                    <div className="mt-auto"></div>
                    <div className="px-3 py-2 border-t border-neutral-300 mt-2">
                        <NavItem
                            icon={<LogOut size={18} />}
                            label="Sign Out"
                            isOpen={isSidebarOpen}
                            onClick={handleSignOut}
                        />
                    </div>

                </div>
            </div>
        </>
    );
};

// --- Sub Components ---

const NavItem = ({ icon, label, isOpen, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={!isOpen ? label : ''}
        className={`
      flex items-center w-full p-2.5 rounded transition-all duration-200 group
      ${active
                ? 'bg-neutral-300 text-neutral-900 font-bold shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'}
      ${!isOpen ? 'justify-center' : ''}
    `}
    >
        <span className={`shrink-0 ${active ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
            {icon || <Settings size={20} />}
        </span>

        <span
            className={`
        ml-1 text-sm whitespace-nowrap overflow-hidden transition-all duration-300
        ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
      `}
        >
            {label}
        </span>
    </button>
);

const LotItem = ({ label, slug, isOpen, isExpanded, onToggle, navigate, currentPath, subItems }) => {
    return (
        <div className="mb-1">
            <button
                onClick={onToggle}
                title={!isOpen ? label : ''}
                className={`
          flex items-center w-full p-2.5 rounded transition-colors duration-200 group
          ${isExpanded
                        ? 'bg-neutral-200 text-neutral-900 font-bold border border-neutral-300'
                        : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 border border-transparent'}
          ${!isOpen ? 'justify-center' : 'justify-between'}
        `}
            >
                <div className={`flex items-center ${!isOpen ? 'justify-center w-full' : ''}`}>
                    <span className="shrink-0">
                        <div
                            className={`
                flex items-center justify-center w-6 h-6 rounded-sm text-xs font-bold transition-colors
                ${isExpanded ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-300 text-neutral-700 group-hover:bg-neutral-400'}
              `}
                        >
                            {/* Initials */}
                            {label.charAt(0)}
                        </div>
                    </span>

                    <span className={`ml-1 text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                        {label}
                    </span>
                </div>

                {isOpen && (
                    <span className="text-neutral-400 group-hover:text-neutral-600">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                )}
            </button>

            {/* Sub Menu */}
            <div
                className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${(isOpen && isExpanded) ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}
        `}
            >
                <div className="ml-5 pl-3 border-l-2 border-neutral-300 space-y-0.5 my-1">
                    {subItems && subItems.map((item, index) => (
                        <SubItem
                            key={index}
                            icon={item.icon}
                            text={item.label}
                            onClick={() => navigate(`/ward/${slug}/${item.path}?name=${encodeURIComponent(label)}`)} 
                            active={currentPath.includes(`/ward/${slug}/${item.path}`)}
                        />
                    ))}
                    {/* Added name param to URL so target page knows exact full name not just slug */}
                </div>
            </div>
        </div>
    );
};

const SubItem = ({ icon, text, onClick, active }) => (
    <button
        onClick={onClick}
        className={`
      flex items-center w-full px-2 py-1.5 text-sm rounded transition-colors group
      ${active ? 'text-blue-700 bg-blue-50 font-bold' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'}
    `}
    >
        <span className={`opacity-75 group-hover:opacity-100 transition-opacity ${active ? 'text-blue-700' : ''}`}>{icon}</span>
        <span className="ml-2.5 font-medium">{text}</span>
    </button>
);

export default Sidebar;
