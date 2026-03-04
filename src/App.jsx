import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { Pencil, Trash2, Plus, Save, Settings, Link as LinkIcon, Image as ImageIcon, LogOut, Lock, Video } from 'lucide-react';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAoIJ9rhj_pgSLiBLEoGX7Gk3AtBMZ4URs",
  authDomain: "ceylon-route-tik-tok-bio.firebaseapp.com",
  projectId: "ceylon-route-tik-tok-bio",
  storageBucket: "ceylon-route-tik-tok-bio.firebasestorage.app",
  messagingSenderId: "539884167369",
  appId: "1:539884167369:web:56738fb16cd98c8c916d18"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'ceylon-route-main-bio';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [tapCount, setTapCount] = useState(0); 
  
  const [profile, setProfile] = useState({
    name: 'Ceylon Route',
    description: 'Download our App & Explore Sri Lanka 👇',
    logoUrl: 'https://ui-avatars.com/api/?name=CR&background=0D8ABC&color=fff&size=128',
    bgUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    bgVideoUrl: '', 
    appLink: 'https://play.google.com/store/apps/details?id=com.ceylonroute'
  });
  const [links, setLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error(err));
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    const pRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'profile');
    onSnapshot(pRef, d => d.exists() ? setProfile(d.data()) : setDoc(pRef, profile));
    const lRef = collection(db, 'artifacts', appId, 'public', 'data', 'links');
    onSnapshot(query(lRef, orderBy('createdAt', 'asc')), s => {
      setLinks(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  const handleImage = (e, cb) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.readAsDataURL(f);
    r.onload = (ev) => {
      const img = new Image(); img.src = ev.target.result;
      img.onload = () => {
        const c = document.createElement('canvas');
        let w = img.width; let h = img.height;
        if (w > 800) { h *= 800 / w; w = 800; }
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        cb(c.toDataURL('image/jpeg', 0.8));
      };
    };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono text-xs tracking-widest animate-pulse">SYSTEM INITIALIZING...</div>;

  if (showLogin) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border-t-8 border-blue-600">
        <div className="flex justify-center mb-6"><Lock className="text-blue-600 w-10 h-10" /></div>
        <h2 className="text-xl font-black text-center text-gray-800 mb-6 uppercase tracking-wider">Admin Area</h2>
        <input type="password" placeholder="PASSWORD" className="w-full p-4 border rounded-xl mb-4 text-center font-mono tracking-widest outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
        <button onClick={() => {if(passwordInput === 'Ceylon@Route2026#') {setIsAdmin(true); setShowLogin(false);} else alert("Incorrect Password!");}} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors">LOGIN</button>
        <button onClick={() => setShowLogin(false)} className="w-full mt-4 text-gray-400 font-bold text-xs uppercase hover:text-gray-600">Cancel</button>
      </div>
    </div>
  );

  if (isAdmin) return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-2"><Settings className="text-blue-600"/> Dashboard</h1>
          <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100"><LogOut size={16}/> Exit</button>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-700">Profile Details</h3><button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-blue-600 font-bold text-sm">{isEditingProfile ? 'Cancel' : 'Edit'}</button></div>
          {isEditingProfile ? (
            <div className="space-y-4">
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="Description" value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
                  <label className="text-xs font-bold text-slate-500 block uppercase cursor-pointer hover:text-blue-500">Logo</label>
                  <span className="text-[9px] text-gray-400 block mb-2 font-mono">1:1 (500x500px)</span>
                  <input type="file" accept="image/*" onChange={e => handleImage(e, b => setProfile({...profile, logoUrl: b}))} className="text-[10px] w-full text-slate-500" />
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
                  <label className="text-xs font-bold text-slate-500 block uppercase cursor-pointer hover:text-blue-500">Fallback Image</label>
                  <span className="text-[9px] text-gray-400 block mb-2 font-mono">9:16 (1080x1920px)</span>
                  <input type="file" accept="image/*" onChange={e => handleImage(e, b => setProfile({...profile, bgUrl: b}))} className="text-[10px] w-full text-slate-500" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Background Video URL (.mp4)</label>
                <p className="text-[10px] text-slate-500 mb-2 leading-tight">Firebase Storage වෙතින් ලබාගත් Direct Link එක මෙතනට Paste කරන්න.</p>
                <input type="url" className="w-full p-3 bg-white border border-blue-200 rounded-md outline-none text-sm" placeholder="https://..." value={profile.bgVideoUrl} onChange={e => setProfile({...profile, bgVideoUrl: e.target.value})} />
              </div>

              <button onClick={async () => { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'profile'), profile); setIsEditingProfile(false); alert("Saved successfully!"); }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700">SAVE PROFILE</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img src={profile.logoUrl} className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200" />
              <div><h4 className="font-bold text-slate-800">{profile.name}</h4><p className="text-gray-500 text-xs">{profile.description}</p></div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-bold text-gray-700">Bio Links</h3><button onClick={() => setEditingLink({ text: '', url: 'https://', icon: 'fab fa-globe', mainColor: '#1877F2', isImage: false, imageSrc: '' })} className="text-white font-bold bg-blue-600 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 shadow-sm">+ NEW LINK</button></div>
          {editingLink && (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-white space-y-4 animate-in slide-in-from-top-4">
              <input className="w-full p-3 bg-white/10 rounded-lg placeholder:text-white/40 border border-white/10 outline-none text-sm" placeholder="BUTTON TEXT" value={editingLink.text} onChange={e => setEditingLink({...editingLink, text: e.target.value})} />
              <input className="w-full p-3 bg-white/10 rounded-lg placeholder:text-white/40 border border-white/10 outline-none text-sm" placeholder="URL LINK" value={editingLink.url} onChange={e => setEditingLink({...editingLink, url: e.target.value})} />
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-xs font-bold block mb-3 uppercase text-gray-300">Icon or Custom Image?</label>
                <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setEditingLink({...editingLink, isImage: false})} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${!editingLink.isImage ? 'bg-blue-500 text-white shadow-md' : 'bg-black/30 text-gray-400 hover:bg-black/50'}`}>Font Icon</button>
                    <button type="button" onClick={() => setEditingLink({...editingLink, isImage: true})} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${editingLink.isImage ? 'bg-blue-500 text-white shadow-md' : 'bg-black/30 text-gray-400 hover:bg-black/50'}`}>Upload Image</button>
                </div>
                {!editingLink.isImage ? (
                    <input className="w-full p-3 bg-black/40 rounded-md text-xs border border-white/5 outline-none placeholder:text-white/30" placeholder="e.g. fab fa-youtube" value={editingLink.icon} onChange={e => setEditingLink({...editingLink, icon: e.target.value})} />
                ) : (
                    <div>
                        <p className="text-[9px] text-gray-400 mb-1 font-mono">100x100px PNG transparent recommended</p>
                        <input type="file" accept="image/*" onChange={e => handleImage(e, b => setEditingLink({...editingLink, imageSrc: b}))} className="text-xs w-full bg-black/40 p-2 rounded-md" />
                    </div>
                )}
              </div>

              <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold block mb-1 uppercase text-gray-300">Button Color</label>
                    <input type="color" className="w-full h-10 rounded-md cursor-pointer bg-white/5 border-none p-1" value={editingLink.mainColor} onChange={e => setEditingLink({...editingLink, mainColor: e.target.value})} />
                  </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={async () => { const r = collection(db, 'artifacts', appId, 'public', 'data', 'links'); if (editingLink.id) await setDoc(doc(r, editingLink.id), editingLink); else await addDoc(r, {...editingLink, createdAt: Date.now()}); setEditingLink(null); }} className="flex-1 bg-blue-500 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-blue-600 text-sm">SAVE</button>
                <button onClick={() => setEditingLink(null)} className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-lg hover:bg-white/20 text-sm">CANCEL</button>
              </div>
            </div>
          )}
          {links.map(l => (
            <div key={l.id} className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white overflow-hidden shadow-sm" style={{ backgroundColor: l.mainColor }}>
                    {l.isImage && l.imageSrc ? <img src={l.imageSrc} className="w-full h-full object-cover" /> : <i className={`${l.icon} text-sm`}></i>}
                </div>
                <div><h4 className="font-bold text-xs text-gray-800">{l.text}</h4><p className="text-[9px] text-slate-400 font-mono truncate w-32 md:w-60">{l.url}</p></div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingLink(l)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"><Pencil size={14}/></button>
                <button onClick={() => {if(confirm("Delete link?")) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'links', l.id))}} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative selection:bg-blue-500/30 font-sans overflow-x-hidden pb-10">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Background Layer - Saturated & Contrasted */}
      <div className="fixed inset-0 w-full h-full bg-cover bg-center z-0 saturate-[1.2] contrast-[1.1]" style={{ backgroundImage: `url(${profile.bgUrl})` }}></div>
      
      {/* Video Background Layer */}
      {profile.bgVideoUrl && (
        <div className="fixed inset-0 z-0">
          <video autoPlay loop muted playsInline webkit-playsinline="true" crossOrigin="anonymous" className="w-full h-full object-cover saturate-[1.2] contrast-[1.1]" src={profile.bgVideoUrl}></video>
        </div>
      )}

      {/* Dark Gradient Overlay for Readability (No blur on background) */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90"></div>

      <div className="relative z-10 max-w-sm mx-auto px-6 pt-16 pb-12 flex flex-col items-center">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center mb-10 cursor-pointer" onClick={() => {setTapCount(c => c + 1); if(tapCount + 1 >= 5) setShowLogin(true); setTimeout(() => setTapCount(0), 2000);}}>
          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-tr from-white/40 to-white/10 shadow-2xl mb-4 group hover:scale-105 transition-transform duration-500 backdrop-blur-sm">
            <img src={profile.logoUrl} className="w-24 h-24 rounded-[2.3rem] object-cover bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" alt="logo" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">{profile.name}</h1>
          <p className="text-gray-200 text-sm mt-1 font-medium text-center drop-shadow-md">{profile.description}</p>
        </div>

        {/* Option 1: Bright Frost & Centered Links Display */}
        <div className="w-full space-y-4">
          {links.map((l, i) => (
            <a key={l.id} href={l.url} target="_blank" rel="noreferrer" 
               className="relative flex items-center justify-center w-full h-[72px] bg-white/20 backdrop-blur-md border border-white/40 rounded-[1.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] group overflow-hidden px-4 hover:bg-white/30 transition-all duration-300 hover:-translate-y-1" 
               style={{ animation: `f-up 0.5s ease forwards ${i * 100}ms` }}>
              
              {/* Icon & Text Grouped and Centered */}
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: l.mainColor }}>
                      {l.isImage && l.imageSrc ? <img src={l.imageSrc} className="w-full h-full object-cover rounded-2xl" /> : <i className={`${l.icon} text-xl drop-shadow-md`}></i>}
                  </div>
                  <span className="text-white font-black tracking-widest uppercase text-[12px] md:text-[13px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-left">
                      {l.text}
                  </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-20 opacity-40 tracking-[0.4em] text-white text-[9px] uppercase font-black drop-shadow-lg">Ceylon Route Tech</div>
      </div>
      <style>{`@keyframes f-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}