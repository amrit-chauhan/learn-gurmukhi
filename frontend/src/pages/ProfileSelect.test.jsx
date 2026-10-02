import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProfileSelect from './ProfileSelect';
import { useProfile } from '../context/ProfileContext';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../context/ProfileContext', () => ({
  useProfile: jest.fn(),
}));

function renderPage() {
  return render(<ProfileSelect />);
}

test('shows a retry action when profiles fail to load', () => {
  const reloadProfiles = jest.fn();
  useProfile.mockReturnValue({
    profiles: [],
    loading: false,
    loadError: true,
    reloadProfiles,
    selectProfile: jest.fn(),
  });

  renderPage();

  expect(screen.getByText("Profiles couldn't be loaded.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(reloadProfiles).toHaveBeenCalledTimes(1);
});

test('renders profile choices after a successful load', () => {
  useProfile.mockReturnValue({
    profiles: [{ id: 'simran', name: 'Simran', avatar: '🦚' }],
    loading: false,
    loadError: false,
    reloadProfiles: jest.fn(),
    selectProfile: jest.fn(),
  });

  renderPage();

  expect(screen.getByRole('button', { name: /Simran/ })).toBeInTheDocument();
});
