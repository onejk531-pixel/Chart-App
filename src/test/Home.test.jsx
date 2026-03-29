import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from '../pages/Home.jsx';

describe('Home', () => {
  it('renders hero title and subtitle', () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    expect(screen.getByText('AI-Powered Chart Pattern Recognition')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Insights')).toBeInTheDocument();
    expect(screen.getByText('Secure & Private')).toBeInTheDocument();
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
  });

  it('shows auth CTA buttons when not logged in', () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
