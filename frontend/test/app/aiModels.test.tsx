import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AIModelsPage from '@/app/ai-models/page';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

describe('app/ai-models', () => {
  it('renders strategies and model cards', () => {
    render(<AIModelsPage />);
    expect(screen.getByText('AI Models')).toBeInTheDocument();
    expect(screen.getByText('Sales Optimized')).toBeInTheDocument();
    expect(screen.getByText('GPT-4.1')).toBeInTheDocument();
    expect(screen.getByText('DeepSeek Chat')).toBeInTheDocument();
  });

  it('selects a routing strategy and flashes confirmation', () => {
    render(<AIModelsPage />);
    fireEvent.click(screen.getByText('Cost Effective'));
    expect(screen.getByText('Routing strategy set to "Cost Effective"')).toBeInTheDocument();
  });

  it('toggles a model on and off', () => {
    render(<AIModelsPage />);
    // GPT-4.1 starts enabled -> disabling it
    const toggles = screen.getAllByRole('button');
    // the model toggle buttons are the round switches; click the first model's switch
    const gptCard = screen.getByText('GPT-4.1').closest('.glass-card') as HTMLElement;
    const gptToggle = gptCard.querySelector('button') as HTMLElement;
    fireEvent.click(gptToggle);
    expect(screen.getByText('GPT-4.1 disabled')).toBeInTheDocument();
    fireEvent.click(gptToggle);
    expect(screen.getByText('GPT-4.1 enabled')).toBeInTheDocument();
    expect(toggles.length).toBeGreaterThan(0);
  });
});
