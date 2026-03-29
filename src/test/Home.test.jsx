import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../pages/Home.jsx';

describe('Home', () => {
  it('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to AI Chart Scanner')).toBeInTheDocument();
  });
});
