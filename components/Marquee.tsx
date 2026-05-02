export default function Marquee() {
  const words = [
    "Compassionate", "Trusted", "Experienced", "Caring",
    "Reliable", "Skilled", "Professional", "Expert",
    "Compassionate", "Trusted", "Experienced", "Caring",
    "Reliable", "Skilled", "Professional", "Expert",
  ];

  return (
    <div className="bg-[#14967F] py-4 overflow-hidden">
      <div className="marquee-track">
        {words.map((word, i) => (
          <span key={i} className="flex items-center">
            <span className="text-white font-medium text-base px-6 whitespace-nowrap">
              {word}
            </span>
            <span className="text-[#FAD069] text-lg">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
