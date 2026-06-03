import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { TrustedContact } from '../types';

export default function TrustedContacts() {
  const { userId } = useApp();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    api.sos
      .listContacts(userId)
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAdd = async () => {
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Nombre y teléfono requeridos');
      return;
    }
    setSaving(true);
    try {
      const contact = await api.sos.addContact({
        passengerId: userId,
        name: name.trim(),
        phone: phone.trim(),
      });
      setContacts((prev) => [...prev, contact]);
      setShowForm(false);
      setName('');
      setPhone('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al agregar contacto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.sos.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Error al eliminar contacto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Contactos de emergencia</h1>
        </div>
        {contacts.length < 3 && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary !px-4 !py-2 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Contactos de emergencia (máx. 3)</p>
          <p className="text-amber-600">
            Estos contactos serán notificados en caso de que actives el botón
            SOS durante un viaje.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <h3 className="font-medium">Nuevo contacto</h3>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            maxLength={100}
          />
          <input
            type="tel"
            placeholder="Teléfono (ej: +521234567890)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-12">
          <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Sin contactos
          </h2>
          <p className="text-sm text-gray-400">
            Agrega hasta 3 contactos de emergencia
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.phone}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(contact.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
