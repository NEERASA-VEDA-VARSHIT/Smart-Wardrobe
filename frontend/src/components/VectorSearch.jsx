import { useState } from 'react';
import { vectorSearch } from '../api';
import { getImageUrl, getImageAlt } from '../utils/imageUtils';

function VectorSearch() {
  const [query, setQuery] = useState('summer casual shirt');
  const [season, setSeason] = useState('');
  const [formality, setFormality] = useState('');
  const [weather, setWeather] = useState('');
  const [limit, setLimit] = useState(8);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const runSearch = async (e) => {
    e?.preventDefault?.();
    try {
      setLoading(true);
      const filter = { season, formality, weather };
      const res = await vectorSearch(query, filter, limit);
      setResults(res.data || res);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Vector Search (Preview)</h3>

      <form onSubmit={runSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          className="input-field md:col-span-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you want (e.g., party red dress)"
        />
        <input className="input-field" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="season (optional)" />
        <input className="input-field" value={formality} onChange={(e) => setFormality(e.target.value)} placeholder="formality (optional)" />
        <input className="input-field" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="weather (optional)" />
        <input className="input-field" value={limit} onChange={(e) => setLimit(e.target.value)} type="number" min="1" max="50" />
        <button type="submit" className="btn-primary md:col-span-1" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
      </form>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((r) => (
            <div key={r._id} className="border rounded-lg p-2">
              <img src={getImageUrl(r.imageUrl)} alt={getImageAlt(r)} className="w-full h-32 object-cover rounded" />
              <div className="mt-2 text-sm">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-gray-600 truncate">{r.description}</div>
                {typeof r.score !== 'undefined' && (
                  <div className="text-gray-500">score: {Number(r.score).toFixed(3)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">No results yet. Try a query and filters.</div>
      )}
    </div>
  );
}

export default VectorSearch;


