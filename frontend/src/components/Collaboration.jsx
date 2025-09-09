import CollectionsManager from './CollectionsManager';

function Collaboration() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Collaboration + Collections</h2>
      <CollectionsManager />
    </div>
  );
}

export default Collaboration;
