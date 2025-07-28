type SplashScreenProps = {
  isFading: boolean;
};

export default function SplashScreen({ isFading }: SplashScreenProps) {
  const containerClassName = `splash-container ${isFading ? 'fading' : ''}`;

  return (
    <div className={containerClassName}>
      <img src="/kula-logo.png" alt="Kula Logo" className="splash-logo" />
      <h1 className="splash-title">Kula</h1>
      <p className="splash-subtitle">Your AI companion for mother and child</p>
    </div>
  );
}