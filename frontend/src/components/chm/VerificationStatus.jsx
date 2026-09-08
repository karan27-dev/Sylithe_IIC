export default function VerificationStatus({ status }) {
    const map = {
      idle: "Draw a polygon to begin",
      running: "Running CHM model…",
      done: "Analysis complete",
      error: "Analysis failed"
    };
  
    return (
      <div className="p-3 rounded bg-gray-100 text-sm">
        {map[status]}
      </div>
    );
  }
  