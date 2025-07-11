import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  Loading, 
  PageLoading, 
  InlineLoading, 
  ButtonLoading, 
  LoadingOverlay,
  AnalyticsLoading,
  RepositoryLoading,
  LoadingError
} from '../loading';

describe('Loading Components', () => {
  describe('Loading', () => {
    it('renders default spinner', () => {
      render(<Loading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<Loading text="Custom loading text" />);
      expect(screen.getByText('Custom loading text')).toBeInTheDocument();
    });

    it('renders different sizes', () => {
      const { rerender } = render(<Loading size="sm" />);
      expect(screen.getByTestId('loading-spinner')).toHaveClass('h-4 w-4');

      rerender(<Loading size="md" />);
      expect(screen.getByTestId('loading-spinner')).toHaveClass('h-6 w-6');

      rerender(<Loading size="lg" />);
      expect(screen.getByTestId('loading-spinner')).toHaveClass('h-8 w-8');
    });

    it('renders dots variant', () => {
      render(<Loading variant="dots" />);
      const dots = screen.getAllByTestId('loading-dot');
      expect(dots).toHaveLength(3);
    });

    it('renders pulse variant', () => {
      render(<Loading variant="pulse" />);
      expect(screen.getByTestId('loading-pulse')).toBeInTheDocument();
    });

    it('renders AI variant', () => {
      render(<Loading variant="ai" />);
      expect(screen.getByTestId('loading-ai')).toBeInTheDocument();
    });

    it('renders bars variant', () => {
      render(<Loading variant="bars" />);
      const bars = screen.getAllByTestId('loading-bar');
      expect(bars).toHaveLength(4);
    });

    it('applies custom className', () => {
      render(<Loading className="custom-class" />);
      expect(screen.getByTestId('loading-container')).toHaveClass('custom-class');
    });
  });

  describe('PageLoading', () => {
    it('renders page loading with default title', () => {
      render(<PageLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we load your data')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<PageLoading title="Custom Loading Title" />);
      expect(screen.getByText('Custom Loading Title')).toBeInTheDocument();
    });
  });

  describe('InlineLoading', () => {
    it('renders inline loading with default text', () => {
      render(<InlineLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<InlineLoading text="Custom inline text" />);
      expect(screen.getByText('Custom inline text')).toBeInTheDocument();
    });
  });

  describe('ButtonLoading', () => {
    it('renders button loading with default text', () => {
      render(<ButtonLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<ButtonLoading text="Processing..." />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('LoadingOverlay', () => {
    it('renders when isOpen is true', () => {
      render(<LoadingOverlay isOpen={true} />);
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<LoadingOverlay isOpen={false} />);
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });

    it('renders with custom text and variant', () => {
      render(<LoadingOverlay isOpen={true} text="Custom overlay text" variant="dots" />);
      expect(screen.getByText('Custom overlay text')).toBeInTheDocument();
    });
  });

  describe('AnalyticsLoading', () => {
    it('renders analytics loading component', () => {
      render(<AnalyticsLoading />);
      expect(screen.getByText('Analyzing Data')).toBeInTheDocument();
      expect(screen.getByText('Generating insights and reports...')).toBeInTheDocument();
    });
  });

  describe('RepositoryLoading', () => {
    it('renders repository loading component', () => {
      render(<RepositoryLoading />);
      expect(screen.getByText('Setting up Repository')).toBeInTheDocument();
      expect(screen.getByText('This may take a few moments...')).toBeInTheDocument();
    });
  });

  describe('LoadingError', () => {
    it('renders error message and retry button', () => {
      const mockOnRetry = jest.fn();
      render(
        <LoadingError 
          error="Something went wrong" 
          onRetry={mockOnRetry}
        />
      );
      
      expect(screen.getByText('Loading Failed')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const mockOnRetry = jest.fn();
      render(
        <LoadingError 
          error="Something went wrong" 
          onRetry={mockOnRetry}
        />
      );
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('renders custom retry text', () => {
      const mockOnRetry = jest.fn();
      render(
        <LoadingError 
          error="Something went wrong" 
          onRetry={mockOnRetry}
          retryText="Custom Retry"
        />
      );
      
      expect(screen.getByText('Custom Retry')).toBeInTheDocument();
    });
  });
});

// Add test IDs to components for better testing
const LoadingWithTestIds = ({ variant = 'default', ...props }) => {
  if (variant === 'dots') {
    return (
      <div data-testid="loading-container" className="flex items-center gap-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div key={i} data-testid="loading-dot" className="h-2 w-2 bg-primary rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div data-testid="loading-container" className="flex items-center gap-2">
        <div data-testid="loading-pulse" className="bg-primary rounded-full h-6 w-6" />
      </div>
    );
  }

  if (variant === 'ai') {
    return (
      <div data-testid="loading-container" className="flex items-center gap-3">
        <div data-testid="loading-ai" className="relative">
          <div className="h-6 w-6 text-purple-500" />
        </div>
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div data-testid="loading-container" className="flex items-center gap-2">
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} data-testid="loading-bar" className="w-1 bg-primary rounded-full h-6" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="loading-container" className="flex items-center gap-2">
      <div data-testid="loading-spinner" className="h-6 w-6" />
    </div>
  );
};

const LoadingOverlayWithTestIds = ({ isOpen, ...props }) => {
  if (!isOpen) return null;

  return (
    <div data-testid="loading-overlay" className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div>Processing...</div>
      </div>
    </div>
  );
};