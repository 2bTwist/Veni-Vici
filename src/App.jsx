import { useState, useEffect } from 'react';

function App() {
  const [backgroundDogs, setBackgroundDogs] = useState([]);
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banList, setBanList] = useState({
    name: [],
    weight: [],
    height: [],
    life_span: []
  });

  useEffect(() => {
    const loadBackgroundDogs = async () => {
      const res = await fetch('https://api.thedogapi.com/v1/images/search?limit=20', {
        headers: {
          'x-api-key': import.meta.env.VITE_DOG_API_KEY
        }
      });
      const data = await res.json();
      setBackgroundDogs(data.map(d => d.url));
    };
    loadBackgroundDogs();
  }, []);

  const isBanned = (breed) => {
    const { name, weight, height, life_span } = breed;
    return (
      banList.name.includes(name) ||
      banList.weight.includes(weight.imperial) ||
      banList.height.includes(height.imperial) ||
      banList.life_span.includes(life_span)
    );
  };

  const fetchDog = async () => {
    setLoading(true);
    try {
      let validDog = null;
      while (!validDog) {
        const res = await fetch('https://api.thedogapi.com/v1/images/search?has_breeds=1', {
          headers: {
            'x-api-key': import.meta.env.VITE_DOG_API_KEY
          }
        });
        const data = await res.json();
        const breed = data[0]?.breeds?.[0];
        if (!breed || isBanned(breed)) continue;
        validDog = data[0];
      }
      setDog(validDog);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToBan = (type, value) => {
    if (!banList[type].includes(value)) {
      setBanList(prev => ({
        ...prev,
        [type]: [...prev[type], value]
      }));
    }
  };

  const removeFromBan = (type, value) => {
    setBanList(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'sans-serif',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        filter: 'brightness(0.4)',
        opacity: 0.6
      }}>
        {backgroundDogs.map((url, i) => (
          <img key={i} src={url} alt="bg dog" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ))}
      </div>

      {/* Main Card */}
      <div style={{
        width: '500px',
        minHeight: '600px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#fff' }}>Veni Vici!</h1>
        <p style={{ fontSize: '1.1rem', color: '#eee' }}>Discover dogs from your wildest dreams!</p>
        <p style={{ fontSize: '2rem', margin: '1rem 0' }}>🐶🐕🦴🐾🐕‍🦺🐩</p>
        <button
          onClick={fetchDog}
          style={{
            background: '#1f1f1f',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          🔄 Discover!
        </button>

        {loading && <p style={{ color: '#ccc' }}>Loading doggo...</p>}

        {dog && (
          <div style={{ marginTop: '1.5rem', color: '#fff' }}>
            <img src={dog.url} alt="dog" style={{ maxWidth: '100%', borderRadius: '1rem' }} />
            <h2
              onClick={() => addToBan('name', dog.breeds[0].name)}
              style={{ cursor: 'pointer', color: '#add8e6', marginTop: '1rem' }}
            >
              {dog.breeds[0].name}
            </h2>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => addToBan('weight', dog.breeds[0].weight.imperial)} className="ban-button">
                🏋️ {dog.breeds[0].weight.imperial}
              </button>
              <button onClick={() => addToBan('height', dog.breeds[0].height.imperial)} className="ban-button">
                📏 {dog.breeds[0].height.imperial}
              </button>
              <button onClick={() => addToBan('life_span', dog.breeds[0].life_span)} className="ban-button">
                ⏳ {dog.breeds[0].life_span}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban List Card */}
      <div style={{
        width: '500px',
        minHeight: '600px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>🚫 Ban List</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'nowrap'
        }}>
          {['weight', 'height', 'life_span', 'name'].map((type) => (
            <div key={type} style={{ flex: 1 }}>
              <h4 style={{ textTransform: 'capitalize', color: '#fda', marginBottom: '0.5rem' }}>
                {type === 'name' ? 'Breed Name' : type.charAt(0).toUpperCase() + type.slice(1)}
              </h4>
              {banList[type].length === 0
                ? <p style={{ fontSize: '0.85rem', color: '#bbb' }}>None</p>
                : (
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {banList[type].map((val, idx) => (
                      <li
                        key={`${type}-${val}-${idx}`}
                        style={{
                          cursor: 'pointer',
                          color: '#ff8888',
                          marginBottom: '0.3rem',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => removeFromBan(type, val)}
                      >
                        {val} ❌
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;
