import { render, screen } from '@testing-library/react';

// The real Skeleton pulls in the "@/lib/utils" webpack alias, which Jest does
// not resolve. Stub it so this presentational test stays self-contained.
jest.mock('../ui/skeleton', () => ({
  Skeleton: ({ className }) => <div data-testid="skeleton" className={className} />,
}));

import HomeSkeleton from './HomeSkeleton';

describe('HomeSkeleton', () => {
  test('renders the skeleton container', () => {
    render(<HomeSkeleton />);
    expect(screen.getByTestId('home-skeleton')).toBeInTheDocument();
  });

  test('shows the static header text', () => {
    render(<HomeSkeleton />);
    expect(screen.getByText('Learn Punjabi')).toBeInTheDocument();
    expect(screen.getByText('Master the Gurmukhi alphabet')).toBeInTheDocument();
  });

  test('is hidden from assistive technology', () => {
    render(<HomeSkeleton />);
    expect(screen.getByTestId('home-skeleton')).toHaveAttribute('aria-hidden', 'true');
  });
});
