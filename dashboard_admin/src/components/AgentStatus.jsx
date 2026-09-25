function AgentStatus() {
  const agents = [
    {
      name: "Research Agent",
      model: "GPT-5",
      status: "Active",
    },
    {
      name: "Analytics Agent",
      model: "GPT-5",
      status: "Active",
    },
    {
      name: "Customer Support",
      model: "GPT-5",
      status: "Active",
    },
    {
      name: "Data Processing",
      model: "Claude",
      status: "Paused",
    },
    {
      name: "Report Generator",
      model: "GPT-5",
      status: "Error",
    },
  ]

  return (
    <div className="agent-status card">
      <div className="section-header">
        <div>
          <h3>Agent Status</h3>
          <p>Current agent availability</p>
        </div>

        <button>View All</button>
      </div>

      <div className="agent-list">
        {agents.map((agent) => (
          <div className="agent-item" key={agent.name}>
            <div className="agent-info">
              <div className="agent-icon">
                🤖
              </div>

              <div>
                <strong>{agent.name}</strong>
                <span>{agent.model}</span>
              </div>
            </div>

            <div className="agent-status-value">
              <span
                className={`status-dot ${agent.status.toLowerCase()}`}
              ></span>

              {agent.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentStatus