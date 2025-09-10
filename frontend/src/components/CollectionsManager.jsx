import { useEffect, useState } from 'react';
import { listCollections, saveCollection, inviteToCollection, listInvitedCollections, getCollectionById, deleteCollectionById } from '../api';
import { getClothes } from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { getImageUrl, getImageAlt } from '../utils/imageUtils';

function CollectionsManager() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [invited, setInvited] = useState([]);
  const [previewItems, setPreviewItems] = useState([]);
  const [saving, setSaving] = useState(false);

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
      setSaving(true);
      await saveCollection({ name, itemIds: selectedIds });
      setName('');
      setSelectedIds([]);
      showSuccess('Collection saved');
      loadData();
    } catch (e) {
      handleApiError(e, 'Failed to save collection');
    } finally {
      setSaving(false);
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

  const loadPreview = async (col) => {
    try {
      setSelectedCollection(col);
      const full = await getCollectionById(col._id);
      const ids = full?.data?.itemIds || [];
      const map = new Map(items.map(i=>[i._id, i]));
      setPreviewItems(ids.map(id=>map.get(id)).filter(Boolean));
    } catch (e) {
      handleApiError(e, 'Failed to load collection');
    }
  };

  const copyShare = async () => {
    if (!selectedCollection) return;
    const link = `${window.location.origin}/stylist/${selectedCollection.ownerId || ''}?collection=${selectedCollection._id}`;
    try { await navigator.clipboard.writeText(link); showSuccess('Share link copied'); } catch { /* noop */ }
  };

  const removeCollection = async () => {
    if (!selectedCollection) return;
    if (!confirm('Delete this collection?')) return;
    try {
      await deleteCollectionById(selectedCollection._id);
      showSuccess('Collection deleted');
      setSelectedCollection(null);
      setPreviewItems([]);
      loadData();
    } catch (e) {
      handleApiError(e, 'Failed to delete collection');
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
                <img src={getImageUrl(it.imageUrl)} alt={getImageAlt(it)} className="w-10 h-10 object-cover rounded" />
                <span className="text-xs truncate">{it.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">Collection details</div>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Collection name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2" />
          <button onClick={create} disabled={saving || !name || selectedIds.length===0} className="btn-primary w-full disabled:opacity-50">{saving? 'Saving...' : 'Save Collection'}</button>
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
                  <button onClick={()=>loadPreview(col)} className="text-sm text-gray-700 hover:text-gray-900">Select</button>
                  <button onClick={copyShare} disabled={!selectedCollection || selectedCollection._id!==col._id} className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50">Copy Link</button>
                  <button onClick={removeCollection} disabled={!selectedCollection || selectedCollection._id!==col._id} className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50">Delete</button>
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

      {/* Preview selected collection */}
      {selectedCollection && (
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Selected Collection Preview</div>
          {previewItems.length === 0 ? (
            <div className="text-sm text-gray-500">No items in this collection</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {previewItems.map(it => (
                <div key={it._id} className="border border-gray-200 rounded-md p-2">
                  <img src={getImageUrl(it.imageUrl)} alt={getImageAlt(it)} className="w-full h-24 object-cover rounded" />
                  <div className="text-xs mt-1 truncate">{it.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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


