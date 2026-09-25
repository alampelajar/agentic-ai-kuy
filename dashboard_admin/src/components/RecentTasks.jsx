function RecentTasks() {
  const tasks = [
    {
      name: "Market Research",
      agent: "Research Agent",
      status: "Completed",
      time: "2 min ago",
    },
    {
      name: "Customer Analysis",
      agent: "Analytics Agent",
      status: "Running",
      time: "5 min ago",
    },
    {
      name: "Generate Report",
      agent: "Report Agent",
      status: "Failed",
      time: "12 min ago",
    },
    {
      name: "Website Research",
      agent: "Research Agent",
      status: "Completed",
      time: "18 min ago",
    },
    {
      name: "Data Processing",
      agent: "Data Agent",
      status: "Running",
      time: "24 min ago",
    },
  ]

  return (
    <div className="recent-tasks card">
      <div className="section-header">
        <div>
          <h3>Recent Tasks</h3>
          <p>Latest agent activities</p>
        </div>

        <button>View All</button>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-item" key={task.name}>
            <div className="task-info">
              <strong>{task.name}</strong>
              <span>{task.agent}</span>
            </div>

            <div className="task-meta">
              <span
                className={`status-badge ${task.status.toLowerCase()}`}
              >
                {task.status}
              </span>

              <small>{task.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentTasks