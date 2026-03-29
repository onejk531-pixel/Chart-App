import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('App', () => {
  it('renders navigation brand and links', () => {
    render(<App />);
    expect(screen.getByText('ChartAI')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders home page hero by default', () => {
    render(<App />);
    expect(screen.getByText('AI-Powered Chart Pattern Recognition')).toBeInTheDocument();
  });
});
