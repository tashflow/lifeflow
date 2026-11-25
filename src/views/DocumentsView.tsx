import React, { useEffect, useRef, useState } from 'react';
import { FolderLock, FileText, Download, ShieldCheck, Plus, Trash2, Upload } from 'lucide-react';
import { DocumentItem } from '../types';
import { generateFirestoreDocId } from '../services/firestoreSerializers';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onAddDocument?: (doc: DocumentItem) => void;
  onDeleteDocument?: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('Identity');
  const [expiryDate, setExpiryDate] = useState('');
  const [fileSizeLabel, setFileSizeLabel] = useState('Metadata Only');
  const [notice, setNotice] = useState<string | null>(null);

  // Keep any selected binary strictly in local browser memory (never sent to Firestore/Cloud Storage)
  const localFileBlobsRef = useRef<Map<string, { url: string; fileName: string }>>(new Map());
  const pendingFileRef = useRef<File | null>(null);

  useEffect(() => {
    const blobs = localFileBlobsRef.current;
    return () => {
      blobs.forEach(({ url }) => URL.revokeObjectURL(url));
      blobs.clear();
    };
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      pendingFileRef.current = null;
      setFileSizeLabel('Metadata Only');
      return;
    }
    pendingFileRef.current = file;
    if (!name.trim()) {
      setName(file.name.slice(0, 200));
    }
    const kb = Math.max(1, Math.round(file.size / 1024));
    const sizeText = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    setFileSizeLabel(sizeText.slice(0, 20));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !onAddDocument) return;
    const id = generateFirestoreDocId('doc');
    if (pendingFileRef.current) {
      const url = URL.createObjectURL(pendingFileRef.current);
      localFileBlobsRef.current.set(id, { url, fileName: pendingFileRef.current.name });
    }
    onAddDocument({
      id,
      name: name.trim().slice(0, 200),
      category,
      uploadDate: new Date().toISOString().split('T')[0],
      size: fileSizeLabel,
      ...(expiryDate.trim() ? { expiryDate: expiryDate.trim().slice(0, 30) } : {}),
    });
    pendingFileRef.current = null;
    setName('');
    setExpiryDate('');
    setFileSizeLabel('Metadata Only');
    setShowModal(false);
  };

  const handleDownload = (docItem: DocumentItem) => {
    const localBlob = localFileBlobsRef.current.get(docItem.id);
    if (localBlob) {
      const link = document.createElement('a');
      link.href = localBlob.url;
      link.download = localBlob.fileName;
      link.click();
      setNotice(`Downloaded session-local file "${localBlob.fileName}".`);
      return;
    }
    setNotice(
      `"${docItem.name}" is tracked as Spark-Free Firestore metadata (${docItem.size}). Attach a file in this browser session to store a local downloadable copy.`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Document Registry &amp; Local Vault</h2>
          <p className="text-xs text-neutral-500">
            Document metadata syncs securely in Firestore. Attached binary files remain strictly device-local in this browser session (Spark Free).
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Metadata Synced • Device-Local Files</span>
          </div>
          {onAddDocument && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold hover:underline shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E9ECE8] text-center text-neutral-400">
          <FolderLock className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-neutral-600">No document metadata records yet.</p>
          <p className="text-xs text-neutral-400 mt-1">Add document metadata to track expiry dates and organize records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(docItem => {
            const hasLocalFile = localFileBlobsRef.current.has(docItem.id);
            return (
              <div key={docItem.id} className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#123D32] bg-[#123D32]/10 px-2.5 py-1 rounded-lg">{docItem.category}</span>
                    <span className="text-xs font-mono text-neutral-400">{docItem.size}</span>
                  </div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-[#123D32] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-neutral-900 leading-snug break-words">{docItem.name}</h3>
                      <span className="text-xs text-neutral-400 block mt-1">Recorded: {docItem.uploadDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-neutral-500 font-mono">
                    {docItem.expiryDate ? `Expires: ${docItem.expiryDate}` : 'Permanent Record'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(docItem)}
                      className="p-2 text-[#123D32] hover:bg-[#123D32]/10 rounded-lg transition-colors"
                      title={hasLocalFile ? 'Download session-local file' : 'Inspect metadata status'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {onDeleteDocument && (
                      <button
                        type="button"
                        onClick={() => {
                          const existing = localFileBlobsRef.current.get(docItem.id);
                          if (existing) {
                            URL.revokeObjectURL(existing.url);
                            localFileBlobsRef.current.delete(docItem.id);
                          }
                          onDeleteDocument(docItem.id);
                        }}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">Add Document Metadata</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Passport 2026"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentItem['category'])}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#123D32]"
                  >
                    <option value="Identity">Identity</option>
                    <option value="Finance">Finance</option>
                    <option value="Medical">Medical</option>
                    <option value="Legal">Legal</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Expiry Date (Opt.)</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Optional Local File (Browser Session Only)
                </label>
                <label className="flex items-center gap-2 px-3.5 py-2.5 border border-dashed border-neutral-300 rounded-xl text-xs text-neutral-600 cursor-pointer hover:border-[#123D32]">
                  <Upload className="w-4 h-4 text-[#123D32]" />
                  <span>{fileSizeLabel === 'Metadata Only' ? 'Choose device file (never uploaded)' : `Attached (${fileSizeLabel})`}</span>
                  <input type="file" onChange={handleFilePick} className="hidden" />
                </label>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

