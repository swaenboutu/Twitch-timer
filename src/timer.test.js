import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Timer from './timer';

// Ne pas mocker Timer globalement ici, cela peut interférer
// jest.mock('./timer', () => { ... });

// Mock useSound pour éviter les erreurs liées au contexte audio dans Jest
jest.mock('use-sound', () => jest.fn(() => [jest.fn(), {}]));

describe('Timer Component', () => {
  // Active les fake timers pour ce bloc describe
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // Restaure les timers réels après chaque test
  afterEach(() => {
    jest.useRealTimers();
  });

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

  test('updates time display after interval', () => {
    const initialDurationSeconds = 60;
    render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    expect(screen.getByText('01:00')).toBeInTheDocument();

    // Avance le temps de 1 seconde
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Vérifie que le temps affiché est mis à jour
    expect(screen.getByText('00:59')).toBeInTheDocument();

     // Avance le temps de 10 secondes supplémentaires
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.getByText('00:49')).toBeInTheDocument();
  });

  test('changes class to "shake" when less than 30 seconds remaining', () => {
    const initialDurationSeconds = 35;
    render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    expect(screen.getByText('00:35')).toHaveClass('pulse');

    // Avance jusqu'à 29 secondes restantes (avance de 6 secondes)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByText('00:29')).toHaveClass('shake');
  });

   test('changes class to "mega-shake" when 10 seconds or less remaining', () => {
    const initialDurationSeconds = 15;
    render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    // Initialement, la classe est "pulse"
    expect(screen.getByText('00:15')).toHaveClass('pulse');

    // Avance d'un tick pour que la mise à jour initiale se fasse (qui devrait passer à shake car < 30s)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:14')).toHaveClass('shake');

    // Avance jusqu'à 10 secondes restantes (avance de 4 secondes supplémentaires)
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.getByText('00:10')).toHaveClass('mega-shake');

     // Avance jusqu'à 5 secondes restantes (avance de 5 secondes)
    act(() => {
        jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:05')).toHaveClass('mega-shake');
  });

  test('calls onEnd prop when timer reaches zero', () => {
    const initialDurationSeconds = 2;
    const mockOnEnd = jest.fn();

    render(<Timer maxDuration={initialDurationSeconds.toString()} onEnd={mockOnEnd} />);

    expect(mockOnEnd).not.toHaveBeenCalled();

    // Avance le temps exactement de la durée initiale en ms
    act(() => {
      jest.advanceTimersByTime(initialDurationSeconds * 1000);
    });

    // À ce point, le dernier intervalle avant 0s s'est exécuté.
    // On avance encore pour déclencher l'intervalle suivant qui constatera total < 0.
    act(() => {
        jest.advanceTimersByTime(1000);
    });

    // Vérifie que onEnd a été appelée une fois
    expect(mockOnEnd).toHaveBeenCalledTimes(1);

    // Avance encore le temps pour s'assurer qu'elle n'est pas rappelée
    act(() => {
        jest.advanceTimersByTime(2000);
    });
    expect(mockOnEnd).toHaveBeenCalledTimes(1);
  });

  test('changes class to "too-late" when timer ends', () => {
    const initialDurationSeconds = 1;
    render(<Timer maxDuration={initialDurationSeconds.toString()} onEnd={jest.fn()} />);

    // Avance jusqu'à la fin
    act(() => {
      jest.advanceTimersByTime(initialDurationSeconds * 1000);
    });

    // Avance d'un tick supplémentaire pour permettre l'exécution de la logique de fin
    act(() => {
        jest.advanceTimersByTime(1000);
    });

    const timerTextElement = screen.getByText(/00:00/);
    expect(timerTextElement).toHaveClass('too-late');
  });

   test('clears interval on unmount', () => {
    const initialDurationSeconds = 60;
    // Espionne window.clearInterval
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { unmount } = render(<Timer maxDuration={initialDurationSeconds.toString()} />);

    // Capture le nombre d'appels après le montage initial
    const callsBeforeUnmount = clearIntervalSpy.mock.calls.length;

    // Démonte le composant
    unmount();

    // Vérifie que window.clearInterval a été appelé au moins une fois de plus lors du démontage.
    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(callsBeforeUnmount);

    // Restaure le spy
    clearIntervalSpy.mockRestore();
  });

}); 