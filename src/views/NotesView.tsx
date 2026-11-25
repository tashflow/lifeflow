import React, { useState } from 'react';
import { BookOpenText, Plus } from 'lucide-react';
import { NoteItem } from '../types';
import { generateFirestoreDocId } from '../services/firestoreSerializers';

interface NotesViewProps {
  notes: NoteItem[];
  onAddNote: (note: NoteItem) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote }) => {
  const [selectedFolder, setSelectedFolder] = useState<'Personal' | 'Ideas' | 'Journal' | 'Work'>('Personal');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState<'Personal' | 'Ideas' | 'Journal' | 'Work'>('Personal');

  const filteredNotes = notes.filter(n => n.folder === selectedFolder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddNote({
      id: generateFirestoreDocId('n'),
      title: title.trim(),
      folder,
      content,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setTitle('');
    setContent('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Notes &amp; Personal Diary</h2>
          <p className="text-xs text-neutral-500">Capture thoughts, journal reflections, and architecture notes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['Personal', 'Ideas', 'Journal', 'Work'] as const).map(f => (
          <button
            key={f}
            onClick={() => setSelectedFolder(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              selectedFolder === f 
                ? 'bg-[#123D32] text-white shadow-sm' 
                : 'bg-white border border-[#E9ECE8] text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {f} Folder
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E9ECE8] text-center text-neutral-400">
          <BookOpenText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-neutral-600">No notes in the {selectedFolder} folder yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#123D32] bg-[#123D32]/10 px-2.5 py-1 rounded-lg">{note.folder}</span>
                  <span className="text-xs font-mono text-neutral-400">Updated: {note.updatedAt}</span>
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{note.title}</h3>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">Create New Note</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Folder</label>
                <select
                  value={folder}
                  onChange={(e: any) => setFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#123D32]"
                >
                  <option value="Personal">Personal</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Journal">Journal</option>
                  <option value="Work">Work</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write note contents..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 font-medium text-sm hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123D32] text-white rounded-xl font-medium text-sm hover:bg-[#1a5244]"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
