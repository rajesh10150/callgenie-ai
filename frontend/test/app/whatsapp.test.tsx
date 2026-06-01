import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WhatsAppPage from '@/app/whatsapp/page';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/api';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/hooks/useApiData', () => ({ __esModule: true, useApiData: jest.fn() }));
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const mockUseApiData = useApiData as jest.Mock;
const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock; put: jest.Mock };
const refetch = jest.fn();

const templates = [
  { id: 't1', name: 'Follow-up', type: 'follow_up', language: 'en', content: 'Hi {{name}}', is_active: true, sent_count: 10 },
  { id: 't2', name: 'Reminder', type: 'reminder', language: 'hi', content: 'Please respond', is_active: false, sent_count: 5 },
];

const withTemplates = (list = templates) =>
  mockUseApiData.mockReturnValue({ data: list, refetch });

describe('app/whatsapp', () => {
  beforeEach(() => withTemplates());

  it('renders stats and template cards', () => {
    render(<WhatsAppPage />);
    expect(screen.getByText('WhatsApp Automation')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
    expect(screen.getByText('Reminder')).toBeInTheDocument();
  });

  it('shows the empty state when there are no templates', () => {
    withTemplates([]);
    render(<WhatsAppPage />);
    expect(screen.getByText('No WhatsApp Templates')).toBeInTheDocument();
  });

  it('validates required fields when creating a template', () => {
    render(<WhatsAppPage />);
    fireEvent.click(screen.getByText('New Template'));
    fireEvent.click(screen.getByText('Create Template'));
    expect(screen.getByText('Name and message content are required.')).toBeInTheDocument();
    expect(mockApi.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('New Template'));
    fireEvent.click(screen.getByLabelText('Close'));
  });

  it('creates a template successfully', async () => {
    mockApi.post.mockResolvedValue({ success: true });
    render(<WhatsAppPage />);
    fireEvent.click(screen.getByText('New Template'));
    fireEvent.change(screen.getByPlaceholderText('Follow-up After Call'), { target: { value: 'Promo' } });
    fireEvent.change(screen.getByPlaceholderText('Hi {{name}}, ...'), { target: { value: 'Buy now' } });
    const form = screen.getByText('Create Template').closest('form') as HTMLElement;
    const selects = within(form).getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'reminder' } });
    fireEvent.change(selects[1], { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('Create Template'));
    expect(await screen.findByText('Created "Promo"')).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/whatsapp/templates', {
      name: 'Promo', type: 'reminder', language: 'hi', content: 'Buy now',
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('edits an existing template', async () => {
    mockApi.put.mockResolvedValue({ success: true });
    render(<WhatsAppPage />);
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save Changes'));
    expect(await screen.findByText('Template updated')).toBeInTheDocument();
    expect(mockApi.put).toHaveBeenCalledWith('/whatsapp/templates/t1', expect.any(Object));
  });

  it('shows server error and connection error on save', async () => {
    mockApi.post.mockResolvedValueOnce({ success: false, error: { message: 'nope' } });
    render(<WhatsAppPage />);
    fireEvent.click(screen.getByText('New Template'));
    fireEvent.change(screen.getByPlaceholderText('Follow-up After Call'), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText('Hi {{name}}, ...'), { target: { value: 'B' } });
    fireEvent.click(screen.getByText('Create Template'));
    expect(await screen.findByText('nope')).toBeInTheDocument();

    mockApi.post.mockRejectedValueOnce(new Error('x'));
    fireEvent.click(screen.getByText('Create Template'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('sends a test message when a lead exists', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [{ id: 'lead1' }] });
    mockApi.post.mockResolvedValue({ success: true });
    render(<WhatsAppPage />);
    fireEvent.click(screen.getAllByText('Send Test')[0]);
    expect(await screen.findByText('Test message queued for "Follow-up"')).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/whatsapp/send', { lead_id: 'lead1', template_id: 't1' });
  });

  it('warns when there are no leads to send a test to', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [] });
    render(<WhatsAppPage />);
    fireEvent.click(screen.getAllByText('Send Test')[0]);
    expect(await screen.findByText('Add a lead first to send a test message.')).toBeInTheDocument();
  });

  it('shows a connection error when send throws', async () => {
    mockApi.get.mockRejectedValue(new Error('x'));
    render(<WhatsAppPage />);
    fireEvent.click(screen.getAllByText('Send Test')[0]);
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('shows the server error when sending a test fails', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [{ id: 'lead1' }] });
    mockApi.post.mockResolvedValue({ success: false, error: { message: 'send fail' } });
    render(<WhatsAppPage />);
    fireEvent.click(within(screen.getByText('Reminder').closest('.glass-card-hover') as HTMLElement).getByText('Send Test'));
    expect(await screen.findByText('send fail')).toBeInTheDocument();
  });
});
