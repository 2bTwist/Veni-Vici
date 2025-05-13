import { useState, useEffect } from 'react';

function App() {
  const [backgroundDogs, setBackgroundDogs] = useState([]);
  const [dog, setDog] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banList, setBanList] = useState({
    name: [],
    weight: [],
    height: [],
    life_span: []
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setHistory(prev => [validDog, ...prev]);
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

  // Responsive breakpoints
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
      padding: isMobile ? '1rem' : '2rem',
      fontFamily: 'sans-serif',
      position: 'relative',
      zIndex: 1,
      flexWrap: 'wrap',
      minHeight: '100vh'
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100px' : '150px'}, 1fr))`,
        filter: 'brightness(0.4)',
        opacity: 0.6
      }}>
        {backgroundDogs.map((url, i) => (
          <img key={i} src={url} alt="bg dog" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ))}
      </div>

      {/* History Sidebar - Only show on desktop */}
      {!isMobile && (
        <div style={{
          width: isTablet ? '200px' : '250px',
          minHeight: '600px',
          maxHeight: isMobile ? '300px' : 'none',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          color: '#fff',
          overflowY: 'auto',
          order: isMobile ? 3 : 1
        }}>
          <h3 style={{ marginBottom: '1rem' }}>👀 Who have we seen so far?</h3>
          {history.length === 0 && <p style={{ color: '#ccc' }}>No dogs yet</p>}
          {history.map((item, index) => {
            const breed = item.breeds[0];
            return (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '0.5rem', 
                borderRadius: '0.5rem' 
              }}>
                <img 
                  src={item.url} 
                  alt="dog" 
                  style={{ 
                    width: '100%', 
                    height: isMobile ? 'auto' : '120px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem' 
                  }} 
                />
                <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 'bold' }}>{breed?.name || 'Unknown'}</p>
                <p style={{ fontSize: '0.85rem', color: '#ccc' }}>{breed?.origin ? `from ${breed.origin}` : 'Origin unknown'}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Card */}
      <div style={{
        width: isMobile ? '100%' : isTablet ? '400px' : '500px',
        minHeight: isMobile ? 'auto' : '600px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: isMobile ? '1.5rem' : '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        order: 2
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '2rem' : '2.5rem', 
          marginBottom: '0.5rem', 
          color: '#fff' 
        }}>
          Veni Vici!
        </h1>
        <p style={{ 
          fontSize: isMobile ? '1rem' : '1.1rem', 
          color: '#eee' 
        }}>
          Discover dogs from your wildest dreams!
        </p>
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
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto'
          }}
          disabled={loading}
        >
          {loading ? '⏳ Loading...' : '🔄 Discover!'}
        </button>

        {loading && <p style={{ color: '#ccc', marginTop: '1rem' }}>Loading doggo...</p>}

        {dog && (
          <div style={{ marginTop: '1.5rem', color: '#fff' }}>
            <img 
              src={dog.url} 
              alt="dog" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: isMobile ? '300px' : '400px',
                borderRadius: '1rem',
                objectFit: 'contain'
              }} 
            />
            <h2
              onClick={() => addToBan('name', dog.breeds[0].name)}
              style={{ 
                cursor: 'pointer', 
                color: '#add8e6', 
                marginTop: '1rem',
                fontSize: isMobile ? '1.5rem' : '1.8rem'
              }}
            >
              {dog.breeds[0].name}
            </h2>
            <div style={{ 
              marginTop: '1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              flexWrap: 'wrap' 
            }}>
              <button 
                onClick={() => addToBan('weight', dog.breeds[0].weight.imperial)} 
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                🏋️ {dog.breeds[0].weight.imperial}
              </button>
              <button 
                onClick={() => addToBan('height', dog.breeds[0].height.imperial)} 
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                📏 {dog.breeds[0].height.imperial}
              </button>
              <button 
                onClick={() => addToBan('life_span', dog.breeds[0].life_span)} 
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                ⏳ {dog.breeds[0].life_span}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban List Card */}
      <div style={{
        width: isMobile ? '100%' : isTablet ? '400px' : '500px',
        minHeight: isMobile ? 'auto' : '600px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: isMobile ? '1.5rem' : '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        order: isMobile ? 4 : 3
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>🚫 Ban List</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          {['weight', 'height', 'life_span', 'name'].map((type) => (
            <div key={type} style={{ 
              flex: isMobile ? '100%' : 1,
              marginBottom: isMobile ? '1rem' : 0
            }}>
              <h4 style={{ 
                textTransform: 'capitalize', 
                color: '#fda', 
                marginBottom: '0.5rem',
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>
                {type === 'name' ? 'Breed Name' : type.charAt(0).toUpperCase() + type.slice(1)}
              </h4>
              {banList[type].length === 0
                ? <p style={{ fontSize: '0.85rem', color: '#bbb' }}>None</p>
                : (
                  <ul style={{ 
                    listStyle: 'none', 
                    paddingLeft: 0,
                    maxHeight: isMobile ? '100px' : '200px',
                    overflowY: 'auto'
                  }}>
                    {banList[type].map((val, idx) => (
                      <li
                        key={`${type}-${val}-${idx}`}
                        style={{
                          cursor: 'pointer',
                          color: '#ff8888',
                          marginBottom: '0.3rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: isMobile ? '0.8rem' : '0.9rem'
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

      {/* Mobile History - Only show on mobile at the bottom */}
      {isMobile && (
        <div style={{
          width: '100%',
          minHeight: '300px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          color: '#fff',
          overflowY: 'auto',
          order: 3
        }}>
          <h3 style={{ marginBottom: '1rem' }}>👀 Recent Dogs</h3>
          {history.length === 0 && <p style={{ color: '#ccc' }}>No dogs yet</p>}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem'
          }}>
            {history.slice(0, 6).map((item, index) => {
              const breed = item.breeds[0];
              return (
                <div key={index} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem' 
                }}>
                  <img 
                    src={item.url} 
                    alt="dog" 
                    style={{ 
                      width: '100%', 
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem' 
                    }} 
                  />
                  <p style={{ 
                    margin: '0.5rem 0 0.25rem', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {breed?.name || 'Unknown'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;