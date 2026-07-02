import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LetterGridItem from './LetterGridItem';

const letter = { id: 'sa', gurmukhi: 'ਸ', romanization: 'sa' };

describe('LetterGridItem', () => {
  test('renders the gurmukhi glyph and romanization', () => {
    render(
      <LetterGridItem letter={letter} selected={false} mastery="new" onToggle={() => {}} />
    );
    expect(screen.getByText('ਸ')).toBeInTheDocument();
    expect(screen.getByText('sa')).toBeInTheDocument();
  });

  test('calls onToggle with the letter id on click', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(
      <LetterGridItem letter={letter} selected={false} mastery="new" onToggle={onToggle} />
    );

    await user.click(screen.getByTestId('letter-tile-sa'));
    expect(onToggle).toHaveBeenCalledWith('sa');
  });

  test('calls onDragStart with id and current selection state on pointer down', () => {
    const onDragStart = jest.fn();
    render(
      <LetterGridItem
        letter={letter}
        selected
        mastery="mastered"
        onToggle={() => {}}
        onDragStart={onDragStart}
      />
    );

    const tile = screen.getByTestId('letter-tile-sa');
    tile.releasePointerCapture = jest.fn();
    tile.dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(onDragStart).toHaveBeenCalledWith('sa', true);
  });

  test('does not render a mastery dot for a new letter', () => {
    render(
      <LetterGridItem letter={letter} selected={false} mastery="new" onToggle={() => {}} />
    );
    expect(screen.getByTestId('letter-tile-sa').querySelector('span.absolute')).toBeNull();
  });

  test('renders a mastery dot for a struggling letter', () => {
    render(
      <LetterGridItem letter={letter} selected={false} mastery="struggling" onToggle={() => {}} />
    );
    expect(screen.getByTestId('letter-tile-sa').querySelector('span.absolute')).not.toBeNull();
  });
});
