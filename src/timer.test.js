import React from 'react';
import { render, screen } from '@testing-library/react';
import Timer from './timer';

// Mock la fonction onEnd car elle n'est pas pertinente pour ces tests unitaires initiaux
jest.mock('./timer', () => {
  const OriginalTimer = jest.requireActual('./timer').default;
  return (props) => <OriginalTimer {...props} onEnd={jest.fn()} />;
});

// Mock useSound car il est utilisé dans App.js qui pourrait être indirectement impliqué
// et pour éviter les erreurs liées au contexte audio dans Jest
jest.mock('use-sound', () => jest.fn(() => [jest.fn(), {}]));

describe('Timer Component', () => {
  test('renders initial time correctly formatted', () => {
    const initialDurationSeconds = 300; // 5 minutes
    render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    // Vérifie que le temps affiché est 05:00 au début
    const timerTextElement = screen.getByText('05:00');
    expect(timerTextElement).toBeInTheDocument();
  });

  test('applies initial CSS class', () => {
    const initialDurationSeconds = 300;
    render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    // Vérifie que l'élément de texte a la classe initiale "pulse"
    const timerTextElement = screen.getByText('05:00');
    expect(timerTextElement).toHaveClass('pulse');
  });

  test('renders SVG elements for timer display', () => {
    const initialDurationSeconds = 300;
    render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    // Vérifie la présence de quelques éléments SVG clés
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    const backgroundCircle = document.getElementById('timer-background');
    expect(backgroundCircle).toBeInTheDocument();

    const borderCircle = document.getElementById('timer-border');
    expect(borderCircle).toBeInTheDocument();
  });

  // On ajoutera des tests pour le comportement dynamique (décompte, classes CSS, onEnd) plus tard
}); 