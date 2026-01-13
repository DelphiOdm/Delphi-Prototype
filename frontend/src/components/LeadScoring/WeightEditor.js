import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_DOMAIN;

export default function WeightEditor({ config, refresh }) {
  const [weights, setWeights] = useState(
    config.map(p => ({
      parameter_id: p.parameter_id,
      parameter_name: p.parameter_name,
      weight: p.weight || 0
    }))
  );

  const total = weights.reduce((a, b) => a + Number(b.weight), 0);

  const save = async () => {
    await axios.put(`${API}/scoring/weights`, weights);
    refresh();
    alert("Weights updated");
  };

  return (
    <>
      <h6>Parameter Weights</h6>

      {weights.map((w, i) => (
        <div key={i} className="d-flex mb-2">
          <div className="flex-grow-1">{w.parameter_name}</div>
          <input
            type="number"
            value={w.weight}
            onChange={e => {
              const copy = [...weights];
              copy[i].weight = e.target.value;
              setWeights(copy);
            }}
            style={{ width: "80px" }}
          />
        </div>
      ))}

      <div className="fw-bold mt-2">
        Total: {total} / 100
      </div>

      <button
        className="btn btn-primary mt-2"
        disabled={total !== 100}
        onClick={save}
      >
        Save Weights
      </button>
    </>
  );
}
