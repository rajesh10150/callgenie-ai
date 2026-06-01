import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LeadsPage from '@/app/leads/page';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/api';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/hooks/useApiData', () => ({ __esModule: true, useApiData: jest.fn() }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }));

const mockUseApiData = useApiData as jest.Mock;
const mockApi = api as unknown as { post: jest.Mock };
const refetch = jest.fn();

const leads = [
  { id: '1', first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', phone: '111', company: 'Realty', status: 'qualified', score: 85, source: 'csv_import', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', first_name: 'Rahul', last_name: 'Kumar', email: 'rahul@example.com', phone: '222', company: 'Insure', status: 'converted', score: 40, source: 'manual', created_at: '2024-01-18T14:20:00Z' },
];

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
const fakeFile = (csv: string) => ({ text: () => Promise.resolve(csv) });

beforeEach(() => mockUseApiData.mockReturnValue({ data: leads, refetch }));

describe('app/leads', () => {
  it('renders stats and lead rows; filters by search and status', () => {
    render(<LeadsPage />);
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search by name, email, company...'), { target: { value: 'rahul' } });
    expect(screen.getByText('Rahul Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Priya Sharma')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search by name, email, company...'), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('All Status'), { target: { value: 'qualified' } });
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.queryByText('Rahul Kumar')).not.toBeInTheDocument();
  });

  it('validates the add-lead form', () => {
    render(<LeadsPage />);
    fireEvent.click(screen.getByText('Add Lead'));
    fireEvent.submit(screen.getByPlaceholderText('Priya').closest('form')!);
    expect(screen.getByText('First name and a valid phone (10+ digits) are required.')).toBeInTheDocument();
    expect(mockApi.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Add Lead'));
    fireEvent.click(screen.getByLabelText('Close'));
  });

  it('adds a lead successfully and reports failures', async () => {
    mockApi.post.mockResolvedValueOnce({ success: true });
    render(<LeadsPage />);
    fireEvent.click(screen.getByText('Add Lead'));
    fireEvent.change(screen.getByPlaceholderText('Priya'), { target: { value: 'New' } });
    fireEvent.change(screen.getByPlaceholderText('Sharma'), { target: { value: 'Person' } });
    fireEvent.change(screen.getByPlaceholderText('priya@example.com'), { target: { value: 'new@p.com' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('Sharma Realty'), { target: { value: 'NewCo' } });
    fireEvent.submit(screen.getByPlaceholderText('Priya').closest('form')!);
    expect(await screen.findByText('Added New')).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/leads', {
      first_name: 'New', last_name: 'Person', email: 'new@p.com', phone: '9876543210', company: 'NewCo', source: 'manual',
    });

    mockApi.post.mockResolvedValueOnce({ success: false, error: { message: 'dup' } });
    fireEvent.click(screen.getByText('Add Lead'));
    fireEvent.change(screen.getByPlaceholderText('Priya'), { target: { value: 'X' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '9876543210' } });
    fireEvent.submit(screen.getByPlaceholderText('Priya').closest('form')!);
    expect(await screen.findByText('dup')).toBeInTheDocument();

    mockApi.post.mockRejectedValueOnce(new Error('net'));
    fireEvent.submit(screen.getByPlaceholderText('Priya').closest('form')!);
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('exports filtered leads to a CSV file', () => {
    const createUrl = jest.fn().mockReturnValue('blob:x');
    const revokeUrl = jest.fn();
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = createUrl;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revokeUrl;
    render(<LeadsPage />);
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Exported 2 lead(s) to CSV')).toBeInTheDocument();
    expect(createUrl).toHaveBeenCalled();
    expect(revokeUrl).toHaveBeenCalled();
  });

  it('imports a CSV (handles quoting, name-splitting and alt headers)', async () => {
    mockApi.post.mockResolvedValue({ success: true, data: { imported: 2, total: 2 } });
    render(<LeadsPage />);
    const csv = 'name,mobile,organization\nJane Doe,9999999999,Acme\n"Bob ""B""",1231231234,"Big, Co"';
    fireEvent.click(screen.getByText('Import CSV'));
    fireEvent.change(fileInput(), { target: { files: [fakeFile(csv)] } });
    expect(await screen.findByText('Imported 2 of 2 lead(s)')).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/leads/import', expect.objectContaining({ leads: expect.any(Array) }));
  });

  it('warns when the CSV has no valid rows', async () => {
    render(<LeadsPage />);
    fireEvent.change(fileInput(), { target: { files: [fakeFile('first_name,phone\nBob,\n')] } });
    expect(await screen.findByText(/No valid rows found/)).toBeInTheDocument();
  });

  it('reports import API failure and thrown errors', async () => {
    mockApi.post.mockResolvedValueOnce({ success: false, error: { message: 'bad csv' } });
    render(<LeadsPage />);
    const good = 'first_name,phone\nAmy,9999999999\n';
    fireEvent.change(fileInput(), { target: { files: [fakeFile(good)] } });
    expect(await screen.findByText('bad csv')).toBeInTheDocument();

    mockApi.post.mockRejectedValueOnce(new Error('net'));
    fireEvent.change(fileInput(), { target: { files: [fakeFile(good)] } });
    expect(await screen.findByText(/Unable to import CSV/)).toBeInTheDocument();
  });

  it('calls a lead (real and demo) and handles errors', async () => {
    mockApi.post.mockResolvedValueOnce({ success: true, data: { status: 'queued' } });
    render(<LeadsPage />);
    const callButton = (name: string) =>
      within(screen.getByText(name).closest('tr') as HTMLElement).getByTitle('Call this lead');
    fireEvent.click(callButton('Priya Sharma'));
    expect(await screen.findByText(/Calling Priya Sharma/)).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/calls/initiate', { lead_id: '1' });

    mockApi.post.mockResolvedValueOnce({ success: true, data: { status: 'demo' } });
    fireEvent.click(callButton('Rahul Kumar'));
    expect(await screen.findByText(/Demo call created for Rahul Kumar/)).toBeInTheDocument();

    mockApi.post.mockResolvedValueOnce({ success: false, error: { message: 'no campaign' } });
    fireEvent.click(callButton('Priya Sharma'));
    expect(await screen.findByText('no campaign')).toBeInTheDocument();

    mockApi.post.mockRejectedValueOnce(new Error('net'));
    fireEvent.click(callButton('Priya Sharma'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });
});
