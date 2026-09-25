import { useEffect, useMemo, useState } from "react"

import { apiFetch } from "../lib/api"

const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase()

  if (
    value === "completed" ||
    value === "complete" ||
    value === "done" ||
    value === "success"
  ) {
    return "Completed"
  }

  if (
    value === "running" ||
    value === "in_progress" ||
    value === "processing"
  ) {
    return "Running"
  }

  if (
    value === "pending" ||
    value === "todo" ||
    value === "queued"
  ) {
    return "Pending"
  }

  if (
    value === "failed" ||
    value === "error"
  ) {
    return "Failed"
  }

  return (
    String(status || "Unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

const parseDate = (value) => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value
  }

  const normalized = String(value).replace(
    " ",
    "T"
  )

  const date = new Date(normalized)

  return Number.isNaN(date.getTime())
    ? null
    : date
}

const formatDateTime = (value) => {
  const date = parseDate(value)

  if (!date) {
    return "-"
  }

  return date.toLocaleString("id-ID")
}

const formatRelativeTime = (value) => {
  const date = parseDate(value)

  if (!date) {
    return "-"
  }

  const diffMs =
    Date.now() - date.getTime()

  if (diffMs < 60 * 1000) {
    return "just now"
  }

  const minutes = Math.floor(
    diffMs / (60 * 1000)
  )

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  const hours = Math.floor(
    minutes / 60
  )

  if (hours < 24) {
    return `${hours} hour${
      hours > 1 ? "s" : ""
    } ago`
  }

  const days = Math.floor(
    hours / 24
  )

  if (days < 7) {
    return `${days} day${
      days > 1 ? "s" : ""
    } ago`
  }

  return formatDateTime(value)
}

const getTaskLogLevel = (status) => {
  if (status === "Failed") {
    return "ERROR"
  }

  return "INFO"
}

const getTaskLogAction = (status) => {
  if (status === "Completed") {
    return "Task completed"
  }

  if (status === "Failed") {
    return "Task failed"
  }

  if (status === "Running") {
    return "Task running"
  }

  if (status === "Pending") {
    return "Task pending"
  }

  return "Task updated"
}

const buildLogs = (users, tasks) => {
  const logs = []

  // ============================================================
  // USER ACTIVITY
  // ============================================================

  users.forEach((user) => {
    if (!user.created_at) {
      return
    }

    logs.push({
      id: `user-${user.id}`,
      time: user.created_at,
      level: "INFO",
      source: "System",
      action: "User registered",
      message: `${user.name || "Unknown User"} (${user.email || "-"}) registered on the platform.`,
      type: "user",
    })
  })

  // ============================================================
  // TASK ACTIVITY
  // ============================================================

  tasks.forEach((task) => {
    const status = normalizeStatus(
      task.status
    )

    const agentName =
      task.agent?.name ||
      "No Agent"

    const userName =
      task.user?.name ||
      "Unknown User"

    const timestamp =
      task.updated_at ||
      task.created_at

    if (!timestamp) {
      return
    }

    logs.push({
      id: `task-${task.id}`,
      time: timestamp,
      level: getTaskLogLevel(status),
      source: agentName,
      action: getTaskLogAction(status),
      message: `${task.title || "Untitled Task"} • User: ${userName}`,
      type: "task",
      taskId: task.id,
      userId: task.user?.id || null,
      agentId: task.agent?.id || null,
      status,
    })
  })

  return logs
    .sort((a, b) => {
      const dateA = parseDate(a.time)
      const dateB = parseDate(b.time)

      if (!dateA || !dateB) {
        return 0
      }

      return dateB - dateA
    })
    .slice(0, 200)
}

function Logs() {
  const [logs, setLogs] = useState([])

  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("All")
  const [sourceFilter, setSourceFilter] = useState("All")

  const [selectedLog, setSelectedLog] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [pageError, setPageError] =
    useState("")

  // ============================================================
  // LOAD LOG DATA
  // ============================================================

  const loadLogs = async () => {
    setLoading(true)
    setPageError("")

    try {
      const [
        usersResponse,
        tasksResponse,
      ] = await Promise.all([
        apiFetch("/api/admin/users"),
        apiFetch("/api/admin/tasks"),
      ])

      const [
        usersData,
        tasksData,
      ] = await Promise.all([
        usersResponse
          .json()
          .catch(() => ({})),
        tasksResponse
          .json()
          .catch(() => ({})),
      ])

      if (!usersResponse.ok) {
        throw new Error(
          usersData?.error ||
            usersData?.message ||
            "Gagal mengambil data users."
        )
      }

      if (!tasksResponse.ok) {
        throw new Error(
          tasksData?.error ||
            tasksData?.message ||
            "Gagal mengambil data tasks."
        )
      }

      const users = Array.isArray(
        usersData?.users
      )
        ? usersData.users
        : []

      const tasks = Array.isArray(
        tasksData?.tasks
      )
        ? tasksData.tasks
        : []

      setLogs(
        buildLogs(users, tasks)
      )
    } catch (error) {
      console.error(
        "Gagal mengambil logs:",
        error
      )

      setPageError(
        error.message ||
          "Gagal mengambil activity logs."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  // ============================================================
  // SOURCES
  // ============================================================

  const sourceOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          logs.map((log) => log.source)
        )
      ).sort(),
    ]
  }, [logs])

  // ============================================================
  // FILTER
  // ============================================================

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchValue =
        search.toLowerCase().trim()

      const matchesSearch =
        log.source
          .toLowerCase()
          .includes(searchValue) ||
        log.action
          .toLowerCase()
          .includes(searchValue) ||
        log.message
          .toLowerCase()
          .includes(searchValue) ||
        log.time
          .toLowerCase()
          .includes(searchValue)

      const matchesLevel =
        levelFilter === "All" ||
        log.level === levelFilter

      const matchesSource =
        sourceFilter === "All" ||
        log.source === sourceFilter

      return (
        matchesSearch &&
        matchesLevel &&
        matchesSource
      )
    })
  }, [
    logs,
    search,
    levelFilter,
    sourceFilter,
  ])

  // ============================================================
  // SUMMARY
  // ============================================================

  const infoCount = logs.filter(
    (log) => log.level === "INFO"
  ).length

  const warningCount = logs.filter(
    (log) => log.level === "WARNING"
  ).length

  const errorCount = logs.filter(
    (log) => log.level === "ERROR"
  ).length

  // ============================================================
  // LEVEL STYLE
  // ============================================================

  const getLevelClass = (level) => {
    if (level === "INFO") {
      return "bg-blue-100 text-blue-700"
    }

    if (level === "WARNING") {
      return "bg-yellow-100 text-yellow-700"
    }

    return "bg-red-100 text-red-700"
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor activity generated by users and tasks
          </p>

        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="
            rounded-lg
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {pageError && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-600">
            {pageError}
          </p>

          <button
            onClick={loadLogs}
            className="
              shrink-0
              rounded-lg
              bg-red-600
              px-3
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
            "
          >
            Retry
          </button>

        </div>
      )}

      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">

          <p className="text-sm font-medium text-slate-500">
            Total Logs
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading
              ? "..."
              : logs.length}
          </p>

        </div>

        {/* Info */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">

          <p className="text-sm font-medium text-slate-500">
            Info
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {loading
              ? "..."
              : infoCount}
          </p>

        </div>

        {/* Warning */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">

          <p className="text-sm font-medium text-slate-500">
            Warnings
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {loading
              ? "..."
              : warningCount}
          </p>

        </div>

        {/* Errors */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">

          <p className="text-sm font-medium text-slate-500">
            Errors
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {loading
              ? "..."
              : errorCount}
          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* LOGS CARD */}
      {/* ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Toolbar */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">

          {/* Search */}

          <div className="relative w-full xl:max-w-md">

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-9
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-slate-400
                focus:bg-white
                focus:ring-2
                focus:ring-slate-100
              "
            />

          </div>

          {/* Filters */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(
                  event.target.value
                )
              }
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-700
                outline-none
                focus:border-slate-400
              "
            >
              <option value="All">
                All Levels
              </option>

              <option value="INFO">
                Info
              </option>

              <option value="WARNING">
                Warning
              </option>

              <option value="ERROR">
                Error
              </option>
            </select>

            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(
                  event.target.value
                )
              }
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-700
                outline-none
                focus:border-slate-400
              "
            >
              {sourceOptions.map(
                (source) => (
                  <option
                    key={source}
                    value={source}
                  >
                    {source === "All"
                      ? "All Sources"
                      : source}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

        {/* Result Info */}

        <div className="border-b border-slate-100 px-5 py-3">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredLogs.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {logs.length}
            </span>{" "}
            logs
          </p>

        </div>

        {/* Loading */}

        {loading ? (
          <div className="px-5 py-16 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

            <p className="mt-4 text-sm text-slate-500">
              Loading activity logs...
            </p>

          </div>
        ) : (
          <>
            {/* Table */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Time
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Level
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Source
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Message
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredLogs.map(
                    (log) => (
                      <tr
                        key={log.id}
                        className="
                          border-b
                          border-slate-100
                          transition
                          hover:bg-slate-50
                        "
                      >

                        {/* Time */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-mono text-sm text-slate-500">
                              {formatRelativeTime(
                                log.time
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatDateTime(
                                log.time
                              )}
                            </p>

                          </div>

                        </td>

                        {/* Level */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${getLevelClass(
                                log.level
                              )}
                            `}
                          >
                            {log.level}
                          </span>

                        </td>

                        {/* Source */}

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {log.source}
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {log.action}
                        </td>

                        {/* Message */}

                        <td className="max-w-xl px-5 py-4 text-sm text-slate-500">
                          {log.message}
                        </td>

                        {/* Details */}

                        <td className="px-5 py-4 text-right">

                          <button
                            onClick={() =>
                              setSelectedLog(
                                log
                              )
                            }
                            className="
                              rounded-lg
                              px-3
                              py-2
                              text-sm
                              font-medium
                              text-slate-600
                              transition
                              hover:bg-slate-100
                              hover:text-slate-900
                            "
                          >
                            Details
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

              {/* Empty State */}

              {filteredLogs.length ===
                0 && (
                <div className="px-5 py-16 text-center">

                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                    ?
                  </div>

                  <h3 className="font-semibold text-slate-800">
                    No logs found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search
                    or filters.
                  </p>

                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* ====================================================== */}
      {/* LOG DETAILS MODAL */}
      {/* ====================================================== */}

      {selectedLog && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-900/40
            p-4
          "
          onClick={() =>
            setSelectedLog(null)
          }
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Log Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Activity generated from current system data
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedLog(null)
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                ×
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Time
                </span>

                <span className="font-mono text-sm text-slate-800">
                  {formatDateTime(
                    selectedLog.time
                  )}
                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Level
                </span>

                <span
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    ${getLevelClass(
                      selectedLog.level
                    )}
                  `}
                >
                  {selectedLog.level}
                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Source
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {selectedLog.source}
                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Action
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {selectedLog.action}
                </span>

              </div>

              <div>

                <p className="mb-2 text-sm text-slate-500">
                  Message
                </p>

                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedLog.message}
                </div>

              </div>

            </div>

            <button
              onClick={() =>
                setSelectedLog(null)
              }
              className="
                mt-6
                w-full
                rounded-lg
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-800
              "
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default Logs
