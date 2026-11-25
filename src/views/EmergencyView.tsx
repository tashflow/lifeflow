import React, { useState } from 'react';
import { ShieldAlert, Phone, HeartPulse, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { EmergencyContact } from '../types';
import { generateFirestoreDocId } from '../services/firestoreSerializers';

interface EmergencyViewProps {
  contacts: EmergencyContact[];
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  onAddContact: (contact: EmergencyContact) => void;
  onUpdateContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  contacts,
  loading = false,
  error = null,
  isAuthenticated = false,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setRelation('');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelation(contact.relation || '');
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedRelation = relation.trim();

    if (!trimmedName || trimmedName.length > 100) {
      setFormError('Contact name is required (max 100 characters).');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length > 50) {
      setFormError('Phone number is required (max 50 characters).');
      return;
    }
    if (trimmedRelation.length > 50) {
      setFormError('Relation must be 50 characters or fewer.');
      return;
    }

    const payload: EmergencyContact = {
      id: editingId ?? generateFirestoreDocId('em'),
      name: trimmedName,
      phone: trimmedPhone,
      ...(trimmedRelation ? { relation: trimmedRelation } : {}),
    };

    if (editingId) {
      onUpdateContact(payload);
    } else {
      onAddContact(payload);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-red-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-900 flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">ICE — In Case of Emergency Card</h2>
            <p className="text-xs text-red-200">
              {isAuthenticated
                ? 'Cloud-synced emergency contacts scoped strictly to your private account.'
                : 'Demo Mode emergency contacts for evaluation.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-900 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {callNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <span>{callNotice}</span>
          <button type="button" onClick={() => setCallNotice(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            <span>Emergency Contacts</span>
          </h3>

          {loading ? (
            <div className="py-10 text-center text-xs text-neutral-500">
              Loading emergency contacts from cloud vault...
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-10 text-center space-y-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 p-6">
              <p className="text-sm font-medium text-neutral-600">No emergency contacts saved yet.</p>
              <p className="text-xs text-neutral-400">Add trusted family members or medical providers for rapid access.</p>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 bg-[#123D32] text-white rounded-xl text-xs font-semibold hover:bg-[#1a5244] transition-colors"
              >
                Add First Contact
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => {
                const sanitizedTel = contact.phone.replace(/[^+\d]/g, '');
                return (
                  <div key={contact.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-neutral-900 block truncate">
                        {contact.name}
                        {contact.relation ? ` (${contact.relation})` : ''}
                      </span>
                      <span className="text-xs font-mono text-neutral-500">{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={sanitizedTel ? `tel:${sanitizedTel}` : undefined}
                        onClick={() => setCallNotice(`Ready to dial ${contact.name} at ${contact.phone}.`)}
                        className="px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                      >
                        Call Now
                      </a>
                      <button
                        type="button"
                        onClick={() => openEditModal(contact)}
                        className="p-2 text-neutral-500 hover:text-[#123D32] hover:bg-neutral-200/60 rounded-lg transition-colors"
                        title="Edit contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteContact(contact.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
              <span>Medical Profile &amp; Insurance</span>
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
              {isAuthenticated ? 'Local Reference' : 'Demo Profile'}
            </span>
          </div>
          {isAuthenticated ? (
            <p className="text-xs text-neutral-500">
              Medical profile fields remain device-local under the current cloud schema; emergency contacts above sync directly to Firestore.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 font-medium">Blood Type</span>
                <span className="font-bold font-mono text-neutral-900">O Positive (O+)</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 font-medium">Allergies</span>
                <span className="font-bold text-neutral-900">None Known</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 font-medium">Insurance Policy</span>
                <span className="font-bold font-mono text-[#123D32]">POL-2026-884</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">
              {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  maxLength={50}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 890-1122"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Relationship (Optional)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="e.g. Spouse, Primary Physician"
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
                  {editingId ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

