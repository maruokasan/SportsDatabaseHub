import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Analytics from '../Analytics';

// Mock all the API calls
jest.mock('../../api/analytics', () => ({
  fetchStandings: jest.fn(),
  fetchGoalsPer90: jest.fn(),
  fetchHeadToHead: jest.fn(),
  fetchInjuryBurden: jest.fn(),
  fetchCareerAverages: jest.fn(),
  fetchConsistency: jest.fn(),
  fetchPlayerVsTeam: jest.fn(),
  fetchPlayerLoadVsInjuries: jest.fn(),
  fetchPlayerWinRate: jest.fn(),
  fetchWinRateByNationality: jest.fn(),
  fetchTopScorers: jest.fn(),
  fetchSeasonalTrend: jest.fn(),
  fetchNationalityPerformance: jest.fn(),
  fetchPresenceImpact: jest.fn(),
  fetchAgeGroupPerformance: jest.fn(),
}));

jest.mock('../../api/players', () => ({
  fetchPlayers: jest.fn(),
}));

jest.mock('../../api/teams', () => ({
  fetchTeams: jest.fn(),
}));

jest.mock('../../api/tournaments', () => ({
  fetchTournaments: jest.fn(),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component, initialEntries = ['/analytics']) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Analytics Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses
    const { fetchAgeGroupPerformance } = require('../../api/analytics');
    const { fetchPlayers, fetchTeams, fetchTournaments } = require('../../api/players');

    fetchAgeGroupPerformance.mockResolvedValue({
      buckets: [
        { bucket: '20-24', avgPerformance: '8.50', count: 20 },
      ],
      meta: { season: null, tournamentId: null, totalSamples: 20 },
    });

    fetchPlayers.mockResolvedValue({ data: [] });
    fetchTeams.mockResolvedValue({ data: [] });
    fetchTournaments.mockResolvedValue({ data: [{ id: 'tournament-1', name: 'Test Tournament' }] });
  });

  it('loads and displays AgeGroupComparison component', async () => {
    renderWithProviders(<Analytics />);

    // Wait for the Age Group Performance section to appear
    await waitFor(() => {
      expect(screen.getByText('Age Group Performance')).toBeInTheDocument();
    });

    // Verify the component is rendered with expected content
    expect(screen.getByText('Average performance by age group')).toBeInTheDocument();
  });

  it('calls fetchAgeGroupPerformance API when component mounts', async () => {
    const { fetchAgeGroupPerformance } = require('../../api/analytics');

    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(fetchAgeGroupPerformance).toHaveBeenCalledWith({});
    });
  });

  it('passes season and tournamentId from context to AgeGroupComparison', async () => {
    const { fetchAgeGroupPerformance } = require('../../api/analytics');

    // Mock outlet context by rendering with a wrapper that provides context
    const TestWrapper = ({ children }) => (
      <div data-testid="outlet-context" data-season="2024" data-tournament="league">
        {children}
      </div>
    );

    renderWithProviders(
      <TestWrapper>
        <Analytics />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(fetchAgeGroupPerformance).toHaveBeenCalledWith({
        season: '2024',
        tournamentId: 'tournament-1', // From mocked tournaments query
      });
    });
  });
});