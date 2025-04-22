import React, { useState } from 'react';

interface BacktestParameters {
  k: number;
  initial_capital: number;
  sell_threshold: number;
  start_quarter: string;
  end_quarter: string;
  random_state: number;
}

interface BacktestParametersFormProps {
  onSubmit: (params: BacktestParameters) => void;
  isLoading?: boolean;
}

const BacktestParametersForm: React.FC<BacktestParametersFormProps> = ({ onSubmit, isLoading }) => {
  const [parameters, setParameters] = useState<BacktestParameters>({
    k: 10,
    initial_capital: 100000,
    sell_threshold: 0.3,
    start_quarter: 'Q1_2021',
    end_quarter: 'Q4_2024',
    random_state: 42,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParameters((prev) => ({
      ...prev,
      [name]: ['k', 'initial_capital', 'sell_threshold', 'random_state'].includes(name)
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parameters);
  };

  if (isLoading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={spinnerStyle}></div>
        <p style={{ marginTop: '16px', color: '#9CA3AF' }}>Running backtest, please wait...</p>
      </div>
    );
  }

  return (
    <div style={formContainerStyle}>
      <h2 style={formHeaderStyle}>Backtest Parameters</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <FormField label="Select top-K stocks" name="k" value={parameters.k} handleChange={handleChange} type="number" />
        <FormField label="Initial Capital" name="initial_capital" value={parameters.initial_capital} handleChange={handleChange} type="number" />
        <FormField label="Sell Threshold (0–1)" name="sell_threshold" value={parameters.sell_threshold} handleChange={handleChange} type="number" min={0} max={1} step={0.01} />
        <FormField label="Start Quarter" name="start_quarter" value={parameters.start_quarter} handleChange={handleChange} />
        <FormField label="End Quarter" name="end_quarter" value={parameters.end_quarter} handleChange={handleChange} />
        <FormField label="Random State" name="random_state" value={parameters.random_state} handleChange={handleChange} type="number" />

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="submit" style={submitStyle}>Run Backtest</button>
        </div>
      </form>
    </div>
  );
};

const FormField = ({ label, name, value, handleChange, type = 'text', min, max, step }: any) => (
  <div style={rowStyle}>
    <label style={labelStyle}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      style={inputStyle}
      required
      min={min}
      max={max}
      step={step}
    />
  </div>
);

const formContainerStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  padding: '32px',
  borderRadius: '10px',
  color: 'white',
  maxWidth: '600px',
  margin: '0 auto',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
};

const formHeaderStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle: React.CSSProperties = {
  marginBottom: '8px',
  fontWeight: 600,
  color: '#9CA3AF',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #374151',
  borderRadius: '6px',
  backgroundColor: '#1F2937',
  color: '#F9FAFB',
  fontSize: '1rem',
  outline: 'none',
};

const submitStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#2563EB',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: 500,
  cursor: 'pointer',
};

const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '300px',
  color: 'white',
};

const spinnerStyle: React.CSSProperties = {
  border: '6px solid #1F2937',
  borderTop: '6px solid #3B82F6',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  animation: 'spin 2s linear infinite', 
};

export default BacktestParametersForm;
