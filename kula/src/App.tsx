import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import MainApp from './MainApp';


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Keep splash screen for 3 seconds
    const timer = setTimeout(() => {
      setIsFading(true); // Start the fade-out animation
    }, 3000); 

    // After the 500ms animation, switch to the main app
    const fadeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (isLoading) {
    return <SplashScreen isFading={isFading} />;
  }

  return <MainApp />;
}