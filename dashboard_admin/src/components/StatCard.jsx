function StatCard({ title, value, change, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div>
          <p className="stat-title">{title}</p>
          <h3>{value}</h3>
        </div>

        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <div className="stat-change">
        {change}
      </div>
    </div>
  )
}

export default StatCard