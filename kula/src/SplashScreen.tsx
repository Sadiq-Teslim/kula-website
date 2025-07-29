type SplashScreenProps = {
  isFading: boolean;
};

export default function SplashScreen({ isFading }: SplashScreenProps) {
  return (
    <div
      className={`bg-gray-100 flex items-center justify-center min-h-screen ${
        isFading ? "fading" : ""
      }`}
    >
      <div className="w-full h-screen md:h-[800px] md:max-w-sm md:rounded-2xl md:shadow-2xl overflow-hidden bg-[#FEFBF6] flex flex-col items-center justify-center font-sans relative">
        <img src="/kula-logo.png" alt="Kula Logo" className="w-24 h-24 mb-6" />
        <h1 className="text-4xl font-bold text-[#4AA8A4] mb-2">Kula</h1>
        <p className="text-lg text-gray-700 text-center px-6">
          Your AI companion for mother and child
        </p>
      </div>
    </div>
  );
}
