export default function Spinner({ large }) {
    return (
      <span className={`spinner${large ? " lg" : ""}`} aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} />
        ))}
      </span>
    );
  }