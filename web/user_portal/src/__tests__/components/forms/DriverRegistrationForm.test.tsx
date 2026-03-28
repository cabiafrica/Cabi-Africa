/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DriverRegistrationForm } from '../../../components/forms/DriverRegistrationForm';

// Mock react-google-recaptcha-v3
const mockExecuteRecaptcha = jest.fn();
jest.mock('react-google-recaptcha-v3', () => ({
  GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useGoogleReCaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha,
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('DriverRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';
    mockExecuteRecaptcha.mockResolvedValue('test-recaptcha-token');
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  const fillOutForm = () => {
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'New York' } });
  };

  it('should render all form fields', () => {
    render(<DriverRegistrationForm />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/referral code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields on submit', async () => {
    render(<DriverRegistrationForm />);
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByText('First name must be at least 2 characters.')).toBeInTheDocument();
      expect(screen.getByText('Last name must be at least 2 characters.')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid phone number.')).toBeInTheDocument();
      expect(screen.getByText('City is required.')).toBeInTheDocument();
    });
  });

  it('should successfully submit the form with valid data', async () => {
    render(<DriverRegistrationForm />);
    fillOutForm();

    fireEvent.click(screen.getByRole('button', { name: /get started/i }));

    await waitFor(() => {
      expect(mockExecuteRecaptcha).toHaveBeenCalledWith('registration');
      expect(fetch).toHaveBeenCalledWith('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          city: 'New York',
          referralCode: '',
          recaptchaToken: 'test-recaptcha-token',
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
    });
  });

  it('should display an API error message on failed submission', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Email already exists.' }),
    });

    render(<DriverRegistrationForm />);
    fillOutForm();

    fireEvent.click(screen.getByRole('button', { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists.')).toBeInTheDocument();
    });
  });

  it('should display an error if reCAPTCHA is not configured', () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = '';
    render(<DriverRegistrationForm />);
    expect(screen.getByText('reCAPTCHA is not configured. Please contact support.')).toBeInTheDocument();
  });

  it('should display an error if executeRecaptcha is not available', async () => {
    mockExecuteRecaptcha.mockImplementationOnce(() => {
      throw new Error('Recaptcha not loaded');
    });

    // Temporarily override the hook for this specific test
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const recaptchaHook = require('react-google-recaptcha-v3');
    recaptchaHook.useGoogleReCaptcha = () => ({ executeRecaptcha: undefined });

    render(<DriverRegistrationForm />);
    fillOutForm();

    fireEvent.click(screen.getByRole('button', { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByText('reCAPTCHA not ready. Please try again in a moment.')).toBeInTheDocument();
    });

    // Restore the hook
    recaptchaHook.useGoogleReCaptcha = () => ({ executeRecaptcha: mockExecuteRecaptcha });
  });
});