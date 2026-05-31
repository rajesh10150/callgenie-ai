import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/components/ui/Modal';

describe('ui/Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={jest.fn()} title="T"><p>body</p></Modal>);
    expect(screen.queryByText('T')).not.toBeInTheDocument();
  });

  it('renders the title and children when open', () => {
    render(<Modal open onClose={jest.fn()} title="My Modal"><p>body</p></Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('calls onClose from the close button', async () => {
    const onClose = jest.fn();
    render(<Modal open onClose={onClose} title="T"><p>body</p></Modal>);
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = jest.fn();
    render(<Modal open onClose={onClose} title="T"><p>body</p></Modal>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<Modal open onClose={jest.fn()} title="T"><p>body</p></Modal>);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal open={false} onClose={jest.fn()} title="T"><p>body</p></Modal>);
    expect(document.body.style.overflow).toBe('');
  });
});
