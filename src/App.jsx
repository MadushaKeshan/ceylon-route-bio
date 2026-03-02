import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { Pencil, Trash2, Plus, Save, Settings, Link as LinkIcon, Image as ImageIcon, LogOut, Lock, Video } from 'lucide-react';

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
    logoUrl: '[https://ui-avatars.com/api/?name=CR&background=0D8ABC&color=fff&size=128](https://ui-avatars.com/api/?name=CR&background=0D8ABC&color=fff&size=128)',
    bgUrl: '[https://images.unsplash.com/photo-1578637387939-43c525550085](https://images.unsplash.com/photo-1578637387939-43c525550085)',
    bgVideoUrl: '[https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4](https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4)', 
    appLink: '[https://play.google.com/store/apps/details?id=com.ceylonroute](https://play.google.com/store/apps/details?id=com.ceylonroute)'
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-blue-500 font-mono text-[10px] tracking-[0.3em]">SYSTEM ONLINE...</div>;

  if (showLogin) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border-b-[10px] border-blue-600">
        <div className="flex justify-center mb-6"><Lock className="text-blue-600 w-12 h-12" /></div>
        <h2 className="text-2xl font-black text-center text-gray-800 mb-6 uppercase tracking-tight">Admin Login</h2>
        <input type="password" placeholder="PASSWORD" className="w-full p-4 border rounded-2xl mb-4 text-center font-mono tracking-widest outline-none focus:ring-2 focus:ring-blue-500" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
        <button onClick={() => {if(passwordInput === 'Ceylon@Route2026#') {setIsAdmin(true); setShowLogin(false);} else alert("වැරදියි!");}} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg">LOGIN</button>
      </div>
    </div>
  );

  if (isAdmin) return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dashboard</h1>
          <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-600 px-5 py-2 rounded-xl font-bold flex items-center gap-2"><LogOut size={18}/> Exit</button>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Profile Info</h3><button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-blue-600 font-bold">{isEditingProfile ? 'Cancel' : 'Edit'}</button></div>
          {isEditingProfile ? (
            <div className="space-y-4">
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl" placeholder="Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl" placeholder="Description" value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} />
              <input type="url" className="w-full p-3 bg-blue-50 rounded-xl" placeholder="Video URL (.mp4)" value={profile.bgVideoUrl} onChange={e => setProfile({...profile, bgVideoUrl: e.target.value})} />
              <button onClick={async () => { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'profile'), profile); setIsEditingProfile(false); alert("Success!"); }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">SAVE</button>
            </div>
          ) : (
            <div className="flex items-center gap-4"><img src={profile.logoUrl} className="w-16 h-16 rounded-2xl object-cover" /><div><h4 className="font-bold">{profile.name}</h4><p className="text-gray-500 text-sm">{profile.description}</p></div></div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-bold">Bio Links</h3><button onClick={() => setEditingLink({ text: '', url: 'https://', icon: 'fab fa-globe', mainColor: '#2563eb' })} className="text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl text-sm">+ NEW</button></div>
          {editingLink && (
            <div className="bg-blue-600 p-6 rounded-3xl shadow-xl text-white space-y-4">
              <input className="w-full p-3 bg-white/10 rounded-xl placeholder:text-white/50 border border-white/20" placeholder="TEXT" value={editingLink.text} onChange={e => setEditingLink({...editingLink, text: e.target.value})} />
              <input className="w-full p-3 bg-white/10 rounded-xl placeholder:text-white/50 border border-white/20" placeholder="URL" value={editingLink.url} onChange={e => setEditingLink({...editingLink, url: e.target.value})} />
              <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold block mb-1">COLOR</label>
                    <input type="color" className="w-full h-10 rounded-lg cursor-pointer bg-white/10 border-none p-1" value={editingLink.mainColor} onChange={e => setEditingLink({...editingLink, mainColor: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold block mb-1">ICON CLASS</label>
                    <input className="w-full p-2 bg-white/10 rounded-lg text-sm border border-white/20" value={editingLink.icon} onChange={e => setEditingLink({...editingLink, icon: e.target.value})} />
                  </div>
              </div>
              <div className="flex gap-2"><button onClick={async () => { const r = collection(db, 'artifacts', appId, 'public', 'data', 'links'); if (editingLink.id) await setDoc(doc(r, editingLink.id), editingLink); else await addDoc(r, {...editingLink, createdAt: Date.now()}); setEditingLink(null); }} className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl">SAVE</button><button onClick={() => setEditingLink(null)} className="flex-1 bg-black/20 text-white font-bold py-3 rounded-xl">CANCEL</button></div>
            </div>
          )}
          {links.map(l => (
            <div key={l.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: l.mainColor }}><i className={l.icon}></i></div><div><h4 className="font-bold text-sm">{l.text}</h4><p className="text-[10px] text-slate-400 font-mono">{l.url}</p></div></div>
              <div className="flex gap-1"><button onClick={() => setEditingLink(l)} className="p-2 text-blue-600"><Pencil size={18}/></button><button onClick={() => {if(confirm("Delete?")) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'links', l.id))}} className="p-2 text-red-600"><Trash2 size={18}/></button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative selection:bg-blue-500/30 font-sans overflow-x-hidden">
      <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)" />
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline webkit-playsinline="true" crossOrigin="anonymous" className="w-full h-full object-cover opacity-60 grayscale-[0.2]" src={profile.bgVideoUrl}></video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black backdrop-blur-[4px]"></div>
      </div>
      <div className="relative z-10 max-w-sm mx-auto px-6 pt-16 pb-20 flex flex-col items-center">
        <div className="flex flex-col items-center mb-10 cursor-pointer" onClick={() => {setTapCount(c => c + 1); if(tapCount + 1 >= 5) setShowLogin(true); setTimeout(() => setTapCount(0), 2000);}}>
          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-tr from-blue-500 to-emerald-400 shadow-2xl mb-4 group hover:scale-105 transition-transform duration-500">
            <img src={profile.logoUrl} className="w-24 h-24 rounded-[2.3rem] object-cover bg-white" alt="logo" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase text-center drop-shadow-lg">{profile.name}</h1>
          <p className="text-white/70 text-sm mt-1 font-medium text-center">{profile.description}</p>
        </div>
        <div className="w-full space-y-4">
          {links.map((l, i) => (
            <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="relative flex items-center w-full h-[72px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] hover:bg-white/20 transition-all duration-300 group overflow-hidden shadow-2xl hover:-translate-y-1" style={{ animation: `f-up 0.5s ease forwards ${i * 100}ms` }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: l.mainColor }}></div>
              <div className="absolute left-3 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/10" style={{ backgroundColor: l.mainColor }}><i className={`${l.icon} text-lg`}></i></div>
              <span className="w-full text-center pr-8 text-white font-black tracking-widest uppercase text-[12px] md:text-[13px] drop-shadow-md">{l.text}</span>
            </a>
          ))}
        </div>
        <div className="mt-24 opacity-30 tracking-[0.4em] text-white text-[9px] uppercase font-black">Ceylon Route Tech</div>
      </div>
      <style>{`@keyframes f-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
