import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImpersonationBanner } from './impersonation-banner';

describe('ImpersonationBanner', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();

    // Mock window.location
    delete window.location;
    window.location = { ...originalLocation, href: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
    jest.clearAllMocks();
  });

  it('should not render if impersonation tokens are not present', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    render(<ImpersonationBanner />);
    expect(screen.queryByText(/You are currently impersonating a user/i)).not.toBeInTheDocument();
  });

  it('should render the banner if impersonation tokens are present', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'impersonation_token') return 'impersonation-jwt';
      if (key === 'original_admin_token') return 'admin-jwt';
      return null;
    });
    render(<ImpersonationBanner />);
    expect(screen.getByText(/You are currently impersonating a user/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stop Impersonating/i })).toBeInTheDocument();
  });

  it('should clear tokens, restore admin token, and redirect when "Stop Impersonating" is clicked', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'impersonation_token') return 'impersonation-jwt';
      if (key === 'original_admin_token') return 'admin-jwt';
      return null;
    });

    render(<ImpersonationBanner />);

    const stopButton = screen.getByRole('button', { name: /Stop Impersonating/i });
    fireEvent.click(stopButton);

    // Verify localStorage calls
    expect(localStorage.removeItem).toHaveBeenCalledWith('impersonation_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('original_admin_token');
    expect(localStorage.setItem).toHaveBeenCalledWith('admin_token', 'admin-jwt');

    // Verify redirection
    expect(window.location.href).toBe('/admin/users');
  });
});