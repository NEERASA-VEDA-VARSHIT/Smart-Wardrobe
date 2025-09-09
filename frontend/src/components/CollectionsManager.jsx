import { useEffect, useState } from 'react';
import { listCollections, saveCollection, inviteToCollection, listInvitedCollections } from '../api';
import { getClothes } from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';

function CollectionsManager() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [invited, setInvited] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, colRes, invRes] = await Promise.all([getClothes(), listCollections(), listInvitedCollections()]);
      setItems(cRes.data || []);
      setCollections(colRes.data || []);
      setInvited(invRes.data || []);
    } catch (e) {
      handleApiError(e, 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const create = async () => {
    if (!name || selectedIds.length === 0) return;
    try {
      await saveCollection({ name, itemIds: selectedIds });
      setName('');
      setSelectedIds([]);
      showSuccess('Collection saved');
      loadData();
    } catch (e) {
      handleApiError(e, 'Failed to save collection');
    }
  };

  const invite = async () => {
    if (!selectedCollection || !inviteEmail) return;
    try {
      const res = await inviteToCollection(selectedCollection._id, [inviteEmail]);
      showSuccess('Invite prepared');
      setInviteEmail('');
      if (res.data?.shareLink) {
        try { await navigator.clipboard.writeText(res.data.shareLink); showSuccess('Share link copied'); } catch {}
      }
    } catch (e) {
      handleApiError(e, 'Failed to invite');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Collections (Share Selected Items)</h3>
        <button onClick={loadData} className="text-sm text-gray-600 hover:text-gray-800">Refresh</button>
      </div>

      {/* Create */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium text-gray-700">Pick items</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-auto">
            {items.map(it => (
              <label key={it._id} className={`border rounded-md p-2 flex items-center gap-2 ${selectedIds.includes(it._id) ? 'border-indigo-500' : 'border-gray-200'}`}>
                <input type="checkbox" checked={selectedIds.includes(it._id)} onChange={() => toggle(it._id)} />
                <img src={it.imageUrl} alt={it.name} className="w-10 h-10 object-cover rounded" />
                <span className="text-xs truncate">{it.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">Collection details</div>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Collection name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2" />
          <button onClick={create} disabled={!name || selectedIds.length===0} className="btn-primary w-full disabled:opacity-50">Save Collection</button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        <div className="text-sm font-medium text-gray-700 mb-2">My Collections</div>
        {collections.length === 0 ? (
          <div className="text-sm text-gray-500">No collections yet</div>
        ) : (
          <div className="space-y-2">
            {collections.map(col => (
              <div key={col._id} className={`flex items-center justify-between border rounded-md p-3 ${selectedCollection?._id===col._id?'border-indigo-400 bg-indigo-50':'border-gray-200'}`}>
                <div>
                  <div className="font-medium text-gray-900">{col.name}</div>
                  <div className="text-xs text-gray-500">{col.itemIds.length} items • Perm: {col.permissions}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setSelectedCollection(col)} className="text-sm text-gray-700 hover:text-gray-900">Select</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite */}
      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Invite by email (selected collection)</div>
        <div className="flex gap-2">
          <input value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} placeholder="friend@example.com" className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <button onClick={invite} disabled={!selectedCollection || !inviteEmail} className="btn-primary disabled:opacity-50">Invite</button>
        </div>
        {!selectedCollection && (
          <div className="text-xs text-gray-500 mt-1">Select a collection above to invite</div>
        )}
      </div>

      {/* My Invitations */}
      <div className="mt-8">
        <div className="text-sm font-medium text-gray-700 mb-2">My Invitations</div>
        {invited.length === 0 ? (
          <div className="text-sm text-gray-500">No invitations yet</div>
        ) : (
          <div className="space-y-2">
            {invited.map(c => (
              <div key={c._id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.itemIds.length} items</div>
                </div>
                <a href={`/stylist/${c.ownerId}?collection=${c._id}`} className="btn-primary text-sm">Open</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionsManager;


