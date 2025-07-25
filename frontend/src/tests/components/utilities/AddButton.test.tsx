import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AddButton from '../../../components/utilities/AddButton';
import { BrowserRouter } from 'react-router-dom';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AddButton Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the add button', () => {
    render(
      <BrowserRouter>
        <AddButton />
      </BrowserRouter>
    );
    
    const addButton = screen.getByLabelText('add');
    expect(addButton).toBeInTheDocument();
  });

  it('navigates to /new-entry when clicked', () => {
    render(
      <BrowserRouter>
        <AddButton />
      </BrowserRouter>
    );
    
    const addButton = screen.getByLabelText('add');
    fireEvent.click(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/new-entry');
  });
});