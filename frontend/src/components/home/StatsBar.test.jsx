import { render, screen } from '@testing-library/react';
import StatsBar from './StatsBar';

describe('StatsBar', () => {
  test('renders studied, mastered and total counts with their labels', () => {
    render(<StatsBar studiedCount={12} masteredCount={5} totalLetters={70} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();

    expect(screen.getByText('studied')).toBeInTheDocument();
    expect(screen.getByText('mastered')).toBeInTheDocument();
    expect(screen.getByText('total')).toBeInTheDocument();
  });

  test('renders null when totalLetters is 0', () => {
    const { container } = render(
      <StatsBar studiedCount={0} masteredCount={0} totalLetters={0} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
