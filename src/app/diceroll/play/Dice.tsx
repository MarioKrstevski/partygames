const SIDE_NAMES = ["one", "two", "three", "four", "five", "six"] as const;

export default function Dice({ value }: { value: number }) {
  return (
    <div role="img" aria-label={`Die showing ${value}`}>
      <div className={`dice show-${value}`}>
        {SIDE_NAMES.map((name, sideIndex) => (
          <div key={name} className={`side ${name}`}>
            {Array.from({ length: sideIndex + 1 }, (_, dotIndex) => (
              <span key={dotIndex} className={`dot ${name}-${dotIndex + 1}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
