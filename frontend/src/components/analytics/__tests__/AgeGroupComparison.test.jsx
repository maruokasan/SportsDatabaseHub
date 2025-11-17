import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgeGroupComparison from '../AgeGroupComparison';

// Mock the API
jest.mock('../../../api/analytics', () => ({
  fetchAgeGroupPerformance: jest.fn(),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('AgeGroupComparison', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<AgeGroupComparison />);
    expect(screen.getByText('Loading age group data…')).toBeInTheDocument();
  });

  it('renders chart and table when data is available', async () => {
    const mockData = {
      buckets: [
        { bucket: '<20', avgPerformance: '7.50', count: 10 },
        { bucket: '20-24', avgPerformance: '8.20', count: 25 },
      ],
      meta: { season: null, tournamentId: null, totalSamples: 35 },
    };

    const { fetchAgeGroupPerformance } = require('../../../api/analytics');
    fetchAgeGroupPerformance.mockResolvedValue(mockData);

    renderWithProviders(<AgeGroupComparison />);

    // Wait for data to load
    await screen.findByText('Age Group Performance');

    // Check if chart title is rendered
    expect(screen.getByText('Age Group Performance')).toBeInTheDocument();

    // Check if table headers are rendered
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('Avg Performance')).toBeInTheDocument();
    expect(screen.getByText('Player Count')).toBeInTheDocument();

    // Check if data is rendered in table
    expect(screen.getByText('<20')).toBeInTheDocument();
    expect(screen.getByText('20-24')).toBeInTheDocument();
  });

  it('displays season and tournamentId in meta when provided', async () => {
    const mockData = {
      buckets: [{ bucket: '25-28', avgPerformance: '8.00', count: 15 }],
      meta: { season: '2023', tournamentId: 'tournament-123', totalSamples: 15 },
    };

    const { fetchAgeGroupPerformance } = require('../../../api/analytics');
    fetchAgeGroupPerformance.mockResolvedValue(mockData);

    renderWithProviders(<AgeGroupComparison season="2023" tournamentId="tournament-123" />);

    await screen.findByText('Season 2023 · Tournament filtered');
  });

  it('renders error state when API fails', async () => {
    const { fetchAgeGroupPerformance } = require('../../../api/analytics');
    fetchAgeGroupPerformance.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<AgeGroupComparison />);

    await screen.findByText('Failed to load age group performance data.');
  });
});