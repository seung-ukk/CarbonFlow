import { useEffect, useState } from "react";

function AgentReasoning({ steps }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!steps || steps.length === 0) {
      setVisibleCount(0);
      return;
    }
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

  if (!steps || steps.length === 0) return null;

  return (
    <section className="card">
      <h3 className="card-title mb-4">AI Agent 추론 과정</h3>

      <div className="space-y-2">
        {steps.slice(0, visibleCount).map((step) => (
          <div key={step.step} className="flex gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {step.step}
            </span>
            <div>
              <p className="text-xs font-bold text-violet-700">{step.tool}</p>
              <p className="text-gray-600 mt-0.5 text-xs">{step.result}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AgentReasoning;
