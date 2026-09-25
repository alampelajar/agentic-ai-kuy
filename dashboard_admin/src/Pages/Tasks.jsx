import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

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

const normalizePriority = (priority) => {
  const value = String(priority || "").toLowerCase()

  if (value === "high") {
    return "High"
  }

  if (value === "medium") {
    return "Medium"
  }

  if (value === "low") {
    return "Low"
  }

  return (
    String(priority || "Unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

const formatDateTime = (value) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString("id-ID")
}

const normalizeTask = (task) => {
  return {
    id: task.id,
    title: task.title || "Untitled Task",
    description: task.description || "",
    status: normalizeStatus(task.status),
    label: task.label || "-",
    priority: normalizePriority(task.priority),
    createdAt: task.created_at || null,
    updatedAt: task.updated_at || null,

    user: task.user
      ? {
          id: task.user.id,
          name: task.user.name || "Unknown User",
          email: task.user.email || "-",
        }
      : null,

    agent: task.agent
      ? {
          id: task.agent.id,
          name: task.agent.name || "Unknown Agent",
          slug: task.agent.slug || "-",
        }
      : null,
  }
}

function Tasks() {
  const [tasks, setTasks] = useState([])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")

  const [openMenu, setOpenMenu] = useState(null)

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  })

  const [selectedTask, setSelectedTask] = useState(null)

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState("")

  // ============================================================
  // LOAD TASKS
  // ============================================================

  const loadTasks = async () => {
    setLoading(true)
    setPageError("")

    try {
      const response = await apiFetch("/api/admin/tasks")

      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Gagal mengambil data tasks."
        )
      }

      const tasksData = Array.isArray(data?.tasks)
        ? data.tasks
        : []

      setTasks(tasksData.map(normalizeTask))
    } catch (error) {
      console.error(
        "Gagal mengambil tasks:",
        error
      )

      setPageError(
        error.message ||
          "Gagal mengambil data tasks dari server."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // ============================================================
  // FILTER
  // ============================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchValue =
        search.toLowerCase().trim()

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(searchValue) ||
        String(task.id)
          .toLowerCase()
          .includes(searchValue) ||
        (task.agent?.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        (task.user?.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        (task.user?.email || "")
          .toLowerCase()
          .includes(searchValue)

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    })
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ])

  // ============================================================
  // SUMMARY
  // ============================================================

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length

  const runningTasks = tasks.filter(
    (task) => task.status === "Running"
  ).length

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length

  const failedTasks = tasks.filter(
    (task) => task.status === "Failed"
  ).length

  // ============================================================
  // STATUS / PRIORITY
  // ============================================================

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-green-100 text-green-700"
    }

    if (status === "Running") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (status === "Failed") {
      return "bg-red-100 text-red-700"
    }

    return "bg-slate-100 text-slate-600"
  }

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "bg-red-100 text-red-700"
    }

    if (priority === "Medium") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (priority === "Low") {
      return "bg-slate-100 text-slate-600"
    }

    return "bg-slate-100 text-slate-600"
  }

  // ============================================================
  // ACTION MENU
  // ============================================================

  const toggleActionMenu = (
    event,
    taskId
  ) => {
    if (openMenu === taskId) {
      setOpenMenu(null)
      return
    }

    const buttonRect =
      event.currentTarget.getBoundingClientRect()

    const menuWidth = 160
    const menuHeight = 48
    const gap = 8
    const viewportPadding = 12

    let left =
      buttonRect.right - menuWidth

    if (left < viewportPadding) {
      left = viewportPadding
    }

    if (
      left + menuWidth >
      window.innerWidth - viewportPadding
    ) {
      left =
        window.innerWidth -
        menuWidth -
        viewportPadding
    }

    const spaceBelow =
      window.innerHeight -
      buttonRect.bottom

    const spaceAbove =
      buttonRect.top

    let top

    if (
      spaceBelow >=
      menuHeight + gap
    ) {
      top =
        buttonRect.bottom + gap
    } else if (
      spaceAbove >=
      menuHeight + gap
    ) {
      top =
        buttonRect.top -
        menuHeight -
        gap
    } else {
      top = Math.max(
        viewportPadding,
        Math.min(
          buttonRect.bottom + gap,
          window.innerHeight -
            menuHeight -
            viewportPadding
        )
      )
    }

    setMenuPosition({
      top,
      left,
    })

    setOpenMenu(taskId)
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("All")
    setPriorityFilter("All")
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Tasks
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor tasks from all users
        </p>
      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {pageError && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-600">
            {pageError}
          </p>

          <button
            onClick={loadTasks}
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

        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg
          "
        >
          <p className="text-sm font-medium text-slate-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedTasks}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Successfully completed
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg
          "
        >
          <p className="text-sm font-medium text-slate-500">
            Running
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {runningTasks}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Currently processing
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg
          "
        >
          <p className="text-sm font-medium text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingTasks}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Waiting to run
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg
          "
        >
          <p className="text-sm font-medium text-slate-500">
            Failed
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {failedTasks}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Need attention
          </p>
        </div>

      </div>

      {/* ====================================================== */}
      {/* MAIN CARD */}
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
              placeholder="Search tasks, users, agents..."
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
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
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
                All Status
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Running">
                Running
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Failed">
                Failed
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
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
                All Priority
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>

          </div>

        </div>

        {/* Result Info */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredTasks.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {tasks.length}
            </span>{" "}
            tasks
          </p>

          {(search ||
            statusFilter !== "All" ||
            priorityFilter !== "All") && (
            <button
              onClick={clearFilters}
              className="
                text-sm
                font-medium
                text-slate-500
                transition
                hover:text-slate-900
              "
            >
              Clear filters
            </button>
          )}

        </div>

        {/* Loading */}

        {loading ? (
          <div className="px-5 py-16 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

            <p className="mt-4 text-sm text-slate-500">
              Loading tasks...
            </p>

          </div>
        ) : (
          <>
            {/* Table */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Task
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Agent
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Priority
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTasks.map(
                    (task) => (
                      <tr
                        key={task.id}
                        className="
                          border-b
                          border-slate-100
                          transition
                          hover:bg-slate-50
                        "
                      >

                        {/* Task */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-medium text-slate-900">
                              {task.title}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              TASK #{task.id}
                            </p>

                          </div>

                        </td>

                        {/* User */}

                        <td className="px-5 py-4">

                          {task.user ? (
                            <div>

                              <p className="text-sm font-medium text-slate-800">
                                {task.user.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {task.user.email}
                              </p>

                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Unknown User
                            </span>
                          )}

                        </td>

                        {/* Agent */}

                        <td className="px-5 py-4">

                          {task.agent ? (
                            <div>

                              <p className="text-sm font-medium text-slate-700">
                                {task.agent.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {task.agent.slug}
                              </p>

                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No Agent
                            </span>
                          )}

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${getStatusClass(
                                task.status
                              )}
                            `}
                          >

                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {task.status}

                          </span>

                        </td>

                        {/* Priority */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${getPriorityClass(
                                task.priority
                              )}
                            `}
                          >
                            {task.priority}
                          </span>

                        </td>

                        {/* Created */}

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDateTime(
                            task.createdAt
                          )}
                        </td>

                        {/* Action */}

                        <td className="relative px-5 py-4 text-right">

                          <button
                            onClick={(event) =>
                              toggleActionMenu(
                                event,
                                task.id
                              )
                            }
                            className="
                              inline-flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-lg
                              text-slate-400
                              transition
                              hover:bg-slate-100
                              hover:text-slate-700
                            "
                            aria-label={`Actions for ${task.title}`}
                          >
                            ⋮
                          </button>

                          {openMenu === task.id &&
                            createPortal(
                              <div
                                className="
                                  fixed
                                  z-[100]
                                  w-40
                                  overflow-hidden
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  py-1
                                  text-left
                                  shadow-xl
                                "
                                style={{
                                  top: `${menuPosition.top}px`,
                                  left: `${menuPosition.left}px`,
                                }}
                              >

                                <button
                                  onClick={() => {
                                    setSelectedTask(
                                      task
                                    )
                                    setOpenMenu(null)
                                  }}
                                  className="
                                    block
                                    w-full
                                    px-4
                                    py-2.5
                                    text-sm
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                  "
                                >
                                  View Details
                                </button>

                              </div>,
                              document.body
                            )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

              {/* Empty State */}

              {filteredTasks.length === 0 && (
                <div className="px-5 py-16 text-center">

                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                    ?
                  </div>

                  <h3 className="font-semibold text-slate-800">
                    No tasks found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>

                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* ====================================================== */}
      {/* TASK DETAILS MODAL */}
      {/* ====================================================== */}

      {selectedTask && (
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
            setSelectedTask(null)
          }
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Task Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information from the database
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedTask(null)
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

            {/* Content */}

            <div className="p-6">

              <h3 className="font-semibold text-slate-900">
                {selectedTask.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                TASK #{selectedTask.id}
              </p>

              {selectedTask.description && (
                <div className="mt-5 rounded-lg bg-slate-50 p-4">

                  <p className="text-sm leading-6 text-slate-600">
                    {selectedTask.description}
                  </p>

                </div>
              )}

              <div className="mt-6 rounded-lg border border-slate-200">

                {/* User */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    User
                  </span>

                  <div className="text-right">

                    <p className="text-sm font-semibold text-slate-800">
                      {selectedTask.user?.name ||
                        "Unknown User"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {selectedTask.user?.email ||
                        "-"}
                    </p>

                  </div>

                </div>

                {/* Agent */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Agent
                  </span>

                  <div className="text-right">

                    <p className="text-sm font-semibold text-slate-800">
                      {selectedTask.agent?.name ||
                        "No Agent"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {selectedTask.agent?.slug ||
                        "-"}
                    </p>

                  </div>

                </div>

                {/* Status */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span
                    className={`
                      rounded-full
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      ${getStatusClass(
                        selectedTask.status
                      )}
                    `}
                  >
                    {selectedTask.status}
                  </span>

                </div>

                {/* Priority */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Priority
                  </span>

                  <span
                    className={`
                      rounded-full
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      ${getPriorityClass(
                        selectedTask.priority
                      )}
                    `}
                  >
                    {selectedTask.priority}
                  </span>

                </div>

                {/* Label */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Label
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {selectedTask.label}
                  </span>

                </div>

                {/* Created */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Created
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {formatDateTime(
                      selectedTask.createdAt
                    )}
                  </span>

                </div>

                {/* Updated */}

                <div className="flex items-center justify-between px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Updated
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {formatDateTime(
                      selectedTask.updatedAt
                    )}
                  </span>

                </div>

              </div>

              {/* Close */}

              <button
                onClick={() =>
                  setSelectedTask(null)
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
        </div>
      )}

    </div>
  )
}

export default Tasks
