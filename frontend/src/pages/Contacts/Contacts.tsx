import { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutList, Kanban, MoreHorizontal, Download, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export function Contacts() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await api.get('/contacts');
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contacts', {
        name: newContact.name,
        phoneNumber: newContact.phoneNumber,
        attributes: { email: newContact.email }
      });
      setShowAddModal(false);
      setNewContact({ name: '', phoneNumber: '', email: '' });
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert('Failed to add contact');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-secondary mt-1">Manage your leads and customers.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken transition-colors font-medium text-sm text-secondary">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken transition-colors font-medium text-sm text-secondary">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full bg-surface border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-colors shadow-sm"
            />
          </div>
          <button className="flex items-center space-x-2 bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken transition-colors text-sm text-primary shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        
        <div className="flex items-center bg-surface border border-border rounded-md p-1 shadow-sm shrink-0">
          <button 
            onClick={() => setView('list')}
            className={cn("p-1.5 rounded", view === 'list' ? "bg-sunken text-brand-primary" : "text-secondary hover:text-primary")}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={cn("p-1.5 rounded", view === 'kanban' ? "bg-sunken text-brand-primary" : "text-secondary hover:text-primary")}
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-surface border border-border rounded-xl shadow-sm relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-secondary">Loading contacts...</div>
        ) : view === 'list' ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-secondary uppercase bg-sunken border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium">Added</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                    No contacts found. Add a contact or import a CSV to get started.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                          {contact.name ? contact.name.charAt(0) : '#'}
                        </div>
                        <div>
                          <div className="font-medium text-primary">{contact.name || 'Unknown'}</div>
                          <div className="text-secondary text-xs">{contact.attributes?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{contact.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags?.map((tag: any) => (
                          <span key={tag.id} className="px-2 py-0.5 rounded text-[10px] font-medium bg-sunken text-secondary border border-border">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">{new Date(contact.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-secondary hover:text-primary">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <div className="p-6 flex gap-6 h-full overflow-x-auto items-start bg-base">
            <div className="text-secondary">Kanban view under construction. Use List view.</div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add New Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number (with country code)</label>
                <input required type="text" placeholder="+1234567890" value={newContact.phoneNumber} onChange={e => setNewContact({...newContact, phoneNumber: e.target.value})} className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary/50" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-sunken">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:opacity-90">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
