import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { apiFetch } from "../lib/api"

const normalizeStatus = (status) => {
  if (!status) {
    return "Unknown"
  }

  const value = String(status).toLowerCase()

  if (value === "running") {
    return "Running"
  }

  if (value === "idle") {
    return "Idle"
  }

  if (value === "stopped") {
    return "Stopped"
  }

  if (value === "active") {
    return "Active"
  }

  if (value === "inactive") {
    return "Inactive"
  }

  return (
    String(status).charAt(0).toUpperCase() +
    String(status).slice(1)
  )
}

const normalizeAgent = (agent) => {
  return {
    id: agent.id,
    slug: agent.slug || "-",
    name: agent.name || "Unnamed Agent",
    description: agent.description || "-",
    status: normalizeStatus(agent.status),
    isActive: Boolean(agent.is_active),
    models: Array.isArray(agent.models)
      ? agent.models
      : [],
  }
}

function Agents() {
  const [agents, setAgents] = useState([])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState("")

  const [openMenu, setOpenMenu] = useState(null)

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  })

  const [selectedAgent, setSelectedAgent] = useState(null)

  // ============================================================
  // LOAD AGENTS
  // ============================================================

  const loadAgents = async () => {
    setLoading(true)
    setPageError("")

    try {
      const response = await apiFetch("/api/agents")

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Gagal mengambil data agents."
        )
      }

      const agentsData = Array.isArray(data?.agents)
        ? data.agents
        : []

      setAgents(
        agentsData.map(normalizeAgent)
      )
    } catch (error) {
      console.error(
        "Gagal mengambil agents:",
        error
      )

      setPageError(
        error.message ||
          "Gagal mengambil data agents dari server."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const searchValue =
        search.toLowerCase().trim()

      const matchesSearch =
        agent.name
          .toLowerCase()
          .includes(searchValue) ||
        agent.slug
          .toLowerCase()
          .includes(searchValue) ||
        String(agent.id)
          .toLowerCase()
          .includes(searchValue) ||
        agent.description
          .toLowerCase()
          .includes(searchValue)

      const matchesStatus =
        statusFilter === "All" ||
        agent.status === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })
  }, [agents, search, statusFilter])

  // ============================================================
  // SUMMARY
  // ============================================================

  const activeAgents = agents.filter(
    (agent) => agent.isActive
  ).length

  const runningAgents = agents.filter(
    (agent) => agent.status === "Running"
  ).length

  const totalModels = agents.reduce(
    (total, agent) =>
      total + agent.models.length,
    0
  )

  // ============================================================
  // STATUS
  // ============================================================

  const getStatusClass = (status) => {
    if (
      status === "Running" ||
      status === "Active"
    ) {
      return "bg-green-100 text-green-700"
    }

    if (status === "Idle") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (
      status === "Stopped" ||
      status === "Inactive"
    ) {
      return "bg-slate-100 text-slate-600"
    }

    return "bg-slate-100 text-slate-600"
  }

  // ============================================================
  // ACTION MENU
  // ============================================================

  const toggleActionMenu = (
    event,
    agentId
  ) => {
    if (openMenu === agentId) {
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

    setOpenMenu(agentId)
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("All")
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
          Agents
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and monitor AI agents from your platform
        </p>
      </div>

      {/* ====================================================== */}
      {/* PAGE ERROR */}
      {/* ====================================================== */}

      {pageError && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-600">
            {pageError}
          </p>

          <button
            onClick={loadAgents}
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
            Total Agents
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {agents.length}
          </p>
        </div>

        {/* Active */}

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
            Active
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeAgents}
          </p>
        </div>

        {/* Running */}

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
            {runningAgents}
          </p>
        </div>

        {/* Models */}

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
            Connected Models
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalModels}
          </p>
        </div>

      </div>

      {/* ====================================================== */}
      {/* MAIN CARD */}
      {/* ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* ================================================== */}
        {/* TOOLBAR */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative w-full lg:max-w-md">

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search agents..."
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

          {/* Filter */}

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

              <option value="Running">
                Running
              </option>

              <option value="Idle">
                Idle
              </option>

              <option value="Stopped">
                Stopped
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>

        {/* ================================================== */}
        {/* RESULT INFO */}
        {/* ================================================== */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAgents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {agents.length}
            </span>{" "}
            agents
          </p>

          {(search ||
            statusFilter !== "All") && (
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

        {/* ================================================== */}
        {/* LOADING */}
        {/* ================================================== */}

        {loading ? (
          <div className="px-5 py-16 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

            <p className="mt-4 text-sm text-slate-500">
              Loading agents...
            </p>

          </div>
        ) : (
          <>
            {/* ================================================== */}
            {/* TABLE */}
            {/* ================================================== */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Agent
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Slug
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Active
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Models
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAgents.map(
                    (agent) => (
                      <tr
                        key={agent.id}
                        className="
                          border-b
                          border-slate-100
                          transition
                          hover:bg-slate-50
                        "
                      >

                        {/* Agent */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-900
                                text-sm
                                font-semibold
                                text-white
                              "
                            >
                              AI
                            </div>

                            <div>

                              <p className="font-medium text-slate-900">
                                {agent.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                ID #{agent.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Slug */}

                        <td className="px-5 py-4">

                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {agent.slug}
                          </span>

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
                                agent.status
                              )}
                            `}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {agent.status}
                          </span>

                        </td>

                        {/* Active */}

                        <td className="px-5 py-4">

                          {agent.isActive ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              No
                            </span>
                          )}

                        </td>

                        {/* Models */}

                        <td className="px-5 py-4">

                          <span className="text-sm font-semibold text-slate-700">
                            {agent.models.length}
                          </span>

                        </td>

                        {/* Action */}

                        <td className="relative px-5 py-4 text-right">

                          <button
                            onClick={(event) =>
                              toggleActionMenu(
                                event,
                                agent.id
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
                            aria-label={`Actions for ${agent.name}`}
                          >
                            ⋮
                          </button>

                          {openMenu ===
                            agent.id &&
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
                                    setSelectedAgent(
                                      agent
                                    )

                                    setOpenMenu(
                                      null
                                    )
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

              {/* ================================================= */}
              {/* EMPTY STATE */}
              {/* ================================================= */}

              {filteredAgents.length ===
                0 && (
                <div className="px-5 py-16 text-center">

                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                    ?
                  </div>

                  <h3 className="font-semibold text-slate-800">
                    No agents found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search
                    or filter.
                  </p>

                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* ====================================================== */}
      {/* AGENT DETAILS MODAL */}
      {/* ====================================================== */}

      {selectedAgent && (
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
            setSelectedAgent(null)
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
                  Agent Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information from the database
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedAgent(null)
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

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-900
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  AI
                </div>

                <div>

                  <h3 className="font-semibold text-slate-900">
                    {selectedAgent.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {selectedAgent.slug}
                  </p>

                </div>

              </div>

              {/* Details */}

              <div className="mt-6 rounded-lg border border-slate-200">

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Agent ID
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    #{selectedAgent.id}
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Slug
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {selectedAgent.slug}
                  </span>

                </div>

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
                        selectedAgent.status
                      )}
                    `}
                  >
                    {selectedAgent.status}
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Active
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {selectedAgent.isActive
                      ? "Yes"
                      : "No"}
                  </span>

                </div>

                <div className="flex items-center justify-between px-4 py-3">

                  <span className="text-sm text-slate-500">
                    Connected Models
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {selectedAgent.models.length}
                  </span>

                </div>

              </div>

              {/* Description */}

              <div className="mt-5">

                <p className="mb-2 text-sm font-medium text-slate-700">
                  Description
                </p>

                <div className="rounded-lg bg-slate-50 p-4">

                  <p className="text-sm leading-6 text-slate-600">
                    {selectedAgent.description}
                  </p>

                </div>

              </div>

              {/* Models */}

              <div className="mt-5">

                <p className="mb-2 text-sm font-medium text-slate-700">
                  Models
                </p>

                {selectedAgent.models.length ===
                0 ? (
                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-sm text-slate-500">
                      No models connected.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-2">

                    {selectedAgent.models.map(
                      (model) => (
                        <div
                          key={model.id}
                          className="
                            rounded-lg
                            border
                            border-slate-200
                            p-3
                          "
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div>

                              <p className="text-sm font-semibold text-slate-800">
                                {model.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {model.model_id}
                              </p>

                            </div>

                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {model.provider?.name ||
                                "Unknown Provider"}
                            </span>

                          </div>

                          {model.description && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {model.description}
                            </p>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Close */}

              <button
                onClick={() =>
                  setSelectedAgent(null)
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

export default Agents