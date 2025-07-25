import { render, screen } from '@testing-library/react';
import StatCard from '../../../components/utilities/StatCard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

describe('StatCard Component', () => {
  it('renders the title correctly', () => {
    render(
      <StatCard 
        title="Total Concerts" 
        value="42" 
        icon={<MusicNoteIcon data-testid="test-icon" />} 
      />
    );
    
    expect(screen.getByText('Total Concerts:')).toBeInTheDocument();
  });

  it('renders the value correctly', () => {
    render(
      <StatCard 
        title="Average Rating" 
        value="4.5" 
        icon={<MusicNoteIcon data-testid="test-icon" />} 
      />
    );
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(
      <StatCard 
        title="Bands Seen" 
        value="15" 
        icon={<MusicNoteIcon data-testid="test-icon" />} 
      />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders all components together', () => {
    const title = "Favorite Venues";
    const value = "3";
    
    render(
      <StatCard 
        title={title} 
        value={value} 
        icon={<MusicNoteIcon data-testid="test-icon" />} 
      />
    );
    
    expect(screen.getByText(`${title}:`)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});