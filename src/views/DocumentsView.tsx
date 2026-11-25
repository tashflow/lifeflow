import React from 'react';
import { FolderLock, FileText, Download, ShieldCheck } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsViewProps {
  documents: DocumentItem[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ documents }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Secure Document Vault</h2>
          <p className="text-xs text-neutral-500">End-to-end encrypted storage for identity, medical, legal, and property files.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>AES-256 Encrypted Session</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#123D32] bg-[#123D32]/10 px-2.5 py-1 rounded-lg">{doc.category}</span>
                <span className="text-xs font-mono text-neutral-400">{doc.size}</span>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 text-[#123D32] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 leading-snug">{doc.name}</h3>
                  <span className="text-xs text-neutral-400 block mt-1">Uploaded: {doc.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-mono">
                {doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'Permanent Record'}
              </span>
              <button 
                onClick={() => alert(`Downloading secure copy of ${doc.name}`)}
                className="p-2 text-[#123D32] hover:bg-[#123D32]/10 rounded-lg transition-colors"
                title="Download document"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
