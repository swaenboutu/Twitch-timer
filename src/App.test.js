import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // On peut ajouter une assertion plus spécifique plus tard si nécessaire
  // Par exemple, vérifier la présence d'un élément clé
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
}); 