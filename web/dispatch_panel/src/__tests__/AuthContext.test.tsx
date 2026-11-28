import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TestConsumer = () => {
  const { user, isAuthenticated, hasPermission, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'YES' : 'NO'}</span>
      <span data-testid="user-email">{user?.email || 'NONE'}</span>
      <span data-testid="can-dispatch">{hasPermission('DISPATCH_ASSIGN') ? 'ALLOW' : 'DENY'}</span>
      <button
        onClick={() =>
          login('jwt-123', {
            id: 'd-1',
            email: 'dispatcher@cabi.africa',
            role: 'DISPATCHER',
            permissions: ['DISPATCH_ASSIGN'],
          })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('Dispatch Panel AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated and denies permissions by default', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-state').textContent).toBe('NO');
    expect(screen.getByTestId('can-dispatch').textContent).toBe('DENY');
  });

  it('recovers safely from corrupted localStorage user JSON', () => {
    localStorage.setItem('authToken', 'stale-token');
    localStorage.setItem('authUser', '{invalid-json');
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-state').textContent).toBe('NO');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('authUser')).toBeNull();
    errSpy.mockRestore();
  });

  it('grants explicit permission on login and revokes on logout', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('auth-state').textContent).toBe('YES');
    expect(screen.getByTestId('can-dispatch').textContent).toBe('ALLOW');

    act(() => {
      screen.getByText('Logout').click();
    });
    expect(screen.getByTestId('auth-state').textContent).toBe('NO');
    expect(screen.getByTestId('can-dispatch').textContent).toBe('DENY');
  });
});
