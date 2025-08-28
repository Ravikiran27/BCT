import React, { useState } from 'react';
import { ROLES, ROLE_NAMES } from '../rolesConfig';

export default function RoleSelect({ onSelect }) {
  const [selected, setSelected] = useState(ROLES.Manufacturer);
  return (
    <div style={{ padding: 32 }}>
      <h2>Select Your Role</h2>
      <select value={selected} onChange={e => setSelected(Number(e.target.value))}>
        {Object.entries(ROLE_NAMES).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <button style={{ marginLeft: 16 }} onClick={() => onSelect(selected)}>Continue</button>
    </div>
  );
}
