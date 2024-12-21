import React, { useState } from 'react';
import { getLocation } from '../api'; // Ensure this imports your getLocation function

const FetchLocation = () => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  const handleFetchLocation = async () => {
    try {
      const data = await getLocation(address);
      setLocation(data); // Set the location data
      setError('');
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error fetching location');
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
        placeholder="Enter address"
      />
      <button onClick={handleFetchLocation}>Fetch Location</button>
      {error && <p>{error}</p>}
      {location && <div>{JSON.stringify(location)}</div>} {/* Display location data */}
    </div>
  );
};

export default FetchLocation;
