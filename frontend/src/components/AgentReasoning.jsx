import { useEffect, useState } from "react";

function AgentReasoning({ steps }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);

    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= steps.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [steps]);

  return (
    <section className="card mt-6">
      <h3 className="card-title mb-5">AI Agent 추론 과정</h3>

      <div className="space-y-4">
        {steps.slice(0, visibleCount).map((step) => (
          <div key={step.step} className="sub-card">
            <p className="font-bold text-green-400">
              {step.step}. {step.tool}
            </p>
            <p className="text-slate-300 mt-1">{step.result}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AgentReasoning;