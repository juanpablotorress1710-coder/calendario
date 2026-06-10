import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AnnualView from './components/AnnualView';
import MonthlyView from './components/MonthlyView';

type View = 
  | { type: 'annual' }
  | { type: 'monthly'; year: number; month: number };

export default function App() {
  const { user } = useAuth();
  const [view, setView] = useState<View>({ type: 'annual' });

  if (!user) return <LoginPage />;

  if (view.type === 'monthly') {
    return (
      <MonthlyView
        year={view.year}
        month={view.month}
        onBack={() => setView({ type: 'annual' })}
        onNavigate={(year, month) => setView({ type: 'monthly', year, month })}
      />
    );
  }

  return (
    <AnnualView
      onSelectMonth={(year, month) => setView({ type: 'monthly', year, month })}
    />
  );
}
