import { useEffect, useMemo, useState } from 'react';
import { 
  listShares, 
  inviteShare, 
  acceptShare, 
  getSharedClothes, 
  getSharedOutfits, 
  createSharedOutfit,
  shareWardrobe,
  getSharedWardrobes,
  getSharedWardrobe,
  unshareWardrobe
} from '../api';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import OutfitBuilder from './OutfitBuilder';

function Collaboration() {
  const [shares, setShares] = useState({ outgoing: [], incoming: [] });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [selectedClothIds, setSelectedClothIds] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New wardrobe sharing state
  const [sharedWardrobes, setSharedWardrobes] = useState([]);
  const [selectedWardrobe, setSelectedWardrobe] = useState(null);
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('viewer');

  const canCreate = useMemo(() => ownerId && outfitName && selectedClothIds.length > 0, [ownerId, outfitName, selectedClothIds]);

  const loadShares = async () => {
    try {
      const res = await listShares();
      setShares(res.data);
    } catch (e) {
      handleApiError(e, 'Failed to load shares');
    }
  };

  useEffect(() => { loadShares(); }, []);

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await inviteShare(email);
      setEmail('');
      await loadShares();
      showSuccess('Invite sent successfully!');
    } catch (e) {
      handleApiError(e, 'Failed to send invite');
    }
  };

  const accept = async (e) => {
    e.preventDefault();
    if (!code) return;
    try {
      await acceptShare(code);
      setCode('');
      await loadShares();
      showSuccess('Invite accepted successfully!');
    } catch (e) {
      handleApiError(e, 'Failed to accept invite');
    }
  };

  const loadShared = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const [c, o] = await Promise.all([
        getSharedClothes(ownerId),
        getSharedOutfits(ownerId)
      ]);
      setClothes(c.data || []);
      setOutfits(o.data || []);
    } catch (e) {
      handleApiError(e, 'Failed to load shared wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const createOutfitAction = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    try {
      const res = await createSharedOutfit(ownerId, { name: outfitName, clothIds: selectedClothIds });
      setOutfits(prev => [res.data, ...prev]);
      setOutfitName('');
      setSelectedClothIds([]);
      showSuccess('Outfit created successfully!');
    } catch (e) {
      handleApiError(e, 'Failed to create outfit');
    }
  };

  // New wardrobe sharing functions
  const loadSharedWardrobes = async () => {
    try {
      const res = await getSharedWardrobes();
      setSharedWardrobes(res.data || []);
    } catch (e) {
      handleApiError(e, 'Failed to load shared wardrobes');
    }
  };

  const shareWardrobeAction = async (e) => {
    e.preventDefault();
    if (!shareEmail) return;
    try {
      await shareWardrobe(shareEmail, sharePermission);
      showSuccess(`Wardrobe shared with ${shareEmail} as ${sharePermission}!`);
      setShareEmail('');
      loadSharedWardrobes();
    } catch (e) {
      handleApiError(e, 'Failed to share wardrobe');
    }
  };

  const selectWardrobe = async (wardrobe) => {
    setSelectedWardrobe(wardrobe);
    try {
      const res = await getSharedWardrobe(wardrobe.owner._id);
      setClothes(res.data.clothes || []);
      setOutfits(res.data.outfits || []);
    } catch (e) {
      handleApiError(e, 'Failed to load wardrobe details');
    }
  };

  const handleSaveOutfit = async (outfitData) => {
    if (!selectedWardrobe) return;
    try {
      const res = await createSharedOutfit(selectedWardrobe.owner._id, outfitData);
      setOutfits(prev => [res.data, ...prev]);
      setShowOutfitBuilder(false);
      showSuccess('Outfit created successfully!');
    } catch (e) {
      handleApiError(e, 'Failed to create outfit');
    }
  };

  useEffect(() => {
    loadSharedWardrobes();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Collaboration</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <form onSubmit={sendInvite} className="space-y-2">
          <div className="font-medium text-gray-700">Invite a friend</div>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Friend email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-md">Send Invite</button>
        </form>

        <form onSubmit={accept} className="space-y-2">
          <div className="font-medium text-gray-700">Accept an invite</div>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Invite code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button className="w-full bg-green-600 text-white py-2 rounded-md">Accept</button>
        </form>

        <div className="space-y-2">
          <div className="font-medium text-gray-700">Your shares</div>
          <div className="text-sm text-gray-600">Outgoing: {shares.outgoing.length} • Incoming: {shares.incoming.length}</div>
          <div className="max-h-40 overflow-auto text-sm space-y-1">
            {shares.outgoing.map(s => (
              <div key={s._id} className="py-1 border-b border-gray-100">
                <div>To: {s.friendEmail}</div>
                <div className="text-xs text-gray-500">Status: {s.status}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  Code: {s.inviteCode}
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(s.inviteCode);
                        showSuccess('Invite code copied to clipboard!');
                      } catch (err) {
                        handleApiError(err, 'Failed to copy invite code');
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
            {shares.incoming.map(s => (
              <div key={s._id} className="py-1 border-b border-gray-100">
                <div>From: {s.ownerId?.name || s.ownerId?.email || s.ownerId}</div>
                <div className="text-xs text-gray-500">Status: {s.status}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  Owner ID: {s.ownerId?._id || s.ownerId}
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(s.ownerId?._id || s.ownerId);
                        showSuccess('Owner ID copied to clipboard!');
                      } catch (err) {
                        handleApiError(err, 'Failed to copy owner ID');
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Owner userId"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
          />
          <button 
            onClick={loadShared} 
            disabled={loading || !ownerId}
            className="bg-gray-100 px-4 py-2 rounded-md disabled:bg-gray-300"
          >
            {loading ? 'Loading...' : 'Load Shared Wardrobe'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-medium text-gray-700 mb-2">Shared Clothes</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {clothes.map(c => (
                <label key={c._id} className={`border rounded-md p-2 flex items-center gap-2 ${selectedClothIds.includes(c._id) ? 'border-indigo-500' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={selectedClothIds.includes(c._id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedClothIds(prev => [...prev, c._id]);
                      else setSelectedClothIds(prev => prev.filter(id => id !== c._id));
                    }}
                  />
                  <img src={`http://localhost:8000${c.imageUrl}`} alt={c.name} className="w-10 h-10 object-cover rounded" />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700 mb-2">Prepare Outfit for Owner</div>
            <form onSubmit={createOutfitAction} className="space-y-2">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Outfit name (e.g., 'Casual Friday Look')"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                required
              />
              <button disabled={!canCreate} className="w-full bg-indigo-600 text-white py-2 rounded-md disabled:bg-gray-300">
                ✨ Prepare Outfit
              </button>
            </form>

            <div className="mt-4">
              <div className="font-medium text-gray-700 mb-2">Prepared Outfits</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {outfits.map(o => (
                  <div key={o._id} className="border border-gray-200 rounded-md p-2">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-gray-600">
                      {o.clothIds?.length || 0} items • Prepared by friend
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Wardrobe Sharing Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Wardrobe Sharing</h3>
        
        {/* Share Your Wardrobe */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Share Your Wardrobe</h4>
          <form onSubmit={shareWardrobeAction} className="flex gap-3">
            <input
              type="email"
              placeholder="Friend's email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="viewer">Viewer</option>
              <option value="stylist">Stylist</option>
            </select>
            <button type="submit" className="btn-primary">
              Share
            </button>
          </form>
        </div>

        {/* Shared Wardrobes */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Shared Wardrobes</h4>
          {sharedWardrobes.length === 0 ? (
            <p className="text-gray-500 text-sm">No shared wardrobes yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedWardrobes.map(wardrobe => (
                <div
                  key={wardrobe.owner._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedWardrobe?.owner._id === wardrobe.owner._id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectWardrobe(wardrobe)}
                >
                  <div className="font-medium text-gray-800">{wardrobe.owner.name}</div>
                  <div className="text-sm text-gray-600">{wardrobe.owner.email}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {wardrobe.clothes.length} clothes • {wardrobe.items.length} items
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">
                    Permission: {wardrobe.permission}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stylist Dashboard Access */}
        {sharedWardrobes.some(w => w.permission === 'stylist') && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stylist Dashboard Access</h3>
            <div className="space-y-3">
              {sharedWardrobes
                .filter(wardrobe => wardrobe.permission === 'stylist')
                .map((wardrobe) => (
                  <div key={wardrobe._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{wardrobe.owner.name}</div>
                      <div className="text-sm text-gray-500">Stylist Access</div>
                    </div>
                    <a
                      href={`/stylist/${wardrobe.owner._id}`}
                      className="btn-primary text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Stylist Dashboard
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Outfit Builder for Selected Wardrobe */}
        {selectedWardrobe && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">
                Outfit Builder for {selectedWardrobe.owner.name}
              </h4>
              <button
                onClick={() => setShowOutfitBuilder(true)}
                disabled={selectedWardrobe.permission !== 'stylist'}
                className="btn-primary text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🎨 Build Outfit
              </button>
            </div>
            {selectedWardrobe.permission !== 'stylist' && (
              <p className="text-sm text-gray-500">You need stylist permission to create outfits</p>
            )}
          </div>
        )}
      </div>

      {/* Outfit Builder Modal */}
      {showOutfitBuilder && selectedWardrobe && (
        <OutfitBuilder
          clothes={clothes}
          onSaveOutfit={handleSaveOutfit}
          onCancel={() => setShowOutfitBuilder(false)}
        />
      )}
    </div>
  );
}

export default Collaboration;


