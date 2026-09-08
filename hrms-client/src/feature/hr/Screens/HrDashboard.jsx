import {
  Users,
  UserCheck,
  UserPlus,
  CalendarCheck,
  CalendarX,
  Clock3,
  CalendarDays,
  WalletCards,
  UserRoundPlus,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const HrDashboard = () => {
  const stats = [
    {
      title: "Total Employees",
      value: "125",
      change: "+5.2%",
      changeText: "from last month",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      positive: true,
    },
    {
      title: "Active Employees",
      value: "108",
      change: "+3.8%",
      changeText: "from last month",
      icon: UserCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      positive: true,
    },
    {
      title: "New Employees",
      value: "8",
      change: "+2",
      changeText: "this month",
      icon: UserPlus,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      positive: true,
    },
    {
      title: "Present Today",
      value: "96",
      change: "88.9%",
      changeText: "attendance rate",
      icon: CalendarCheck,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      positive: true,
    },
  ];

  const recentEmployees = [
    {
      name: "John Doe",
      id: "EMP001",
      department: "Engineering",
      designation: "Software Engineer",
      joined: "02 Sep 2026",
      status: "Active",
    },
    {
      name: "Priya Sharma",
      id: "EMP002",
      department: "HR",
      designation: "HR Executive",
      joined: "01 Sep 2026",
      status: "Active",
    },
    {
      name: "Rahul Kumar",
      id: "EMP003",
      department: "Finance",
      designation: "Accountant",
      joined: "29 Aug 2026",
      status: "Active",
    },
    {
      name: "Sneha Reddy",
      id: "EMP004",
      department: "Marketing",
      designation: "Marketing Executive",
      joined: "27 Aug 2026",
      status: "Active",
    },
  ];

  const leaveRequests = [
    {
      name: "Priya Sharma",
      type: "Casual Leave",
      dates: "05 Sep - 06 Sep",
      days: "2 Days",
      status: "Pending",
    },
    {
      name: "Rahul Kumar",
      type: "Sick Leave",
      dates: "07 Sep - 08 Sep",
      days: "2 Days",
      status: "Approved",
    },
    {
      name: "Sneha Reddy",
      type: "Annual Leave",
      dates: "10 Sep - 12 Sep",
      days: "3 Days",
      status: "Pending",
    },
    {
      name: "Arjun Patel",
      type: "Casual Leave",
      dates: "12 Sep",
      days: "1 Day",
      status: "Rejected",
    },
  ];

  const quickActions = [
    {
      label: "Add Employee",
      icon: UserRoundPlus,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Manage Leaves",
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Payroll",
      icon: WalletCards,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Reports",
      icon: BarChart3,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Attendance",
      icon: CalendarCheck,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Payslips",
      icon: FileText,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-5">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            HR Dashboard
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Good morning, Admin 👋
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Here's what's happening across your organization today.
          </p>
        </div>

        <button className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <CalendarDays size={16} />
          <span>04 Sep 2026</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                >
                  <Icon size={20} className={stat.iconColor} />
                </div>

                <button className="text-slate-300 hover:text-slate-500">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-4">
                {stat.title}
              </p>

              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </h3>

                <span className="flex items-center text-xs font-medium text-emerald-600 mb-1">
                  {stat.positive ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {stat.change}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                {stat.changeText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat
          icon={CalendarCheck}
          label="Present Today"
          value="96"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />

        <MiniStat
          icon={CalendarX}
          label="Absent Today"
          value="9"
          color="text-red-600"
          bg="bg-red-50"
        />

        <MiniStat
          icon={Clock3}
          label="Late Employees"
          value="8"
          color="text-amber-600"
          bg="bg-amber-50"
        />

        <MiniStat
          icon={CalendarDays}
          label="On Leave"
          value="12"
          color="text-violet-600"
          bg="bg-violet-50"
        />
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Attendance Overview */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Attendance Overview
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Last 7 days
              </p>
            </div>

            <button className="text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5">
              This Week
            </button>
          </div>

          <div className="h-52 flex items-end justify-between gap-2 px-1">
            {[
              { day: "Mon", value: 82 },
              { day: "Tue", value: 91 },
              { day: "Wed", value: 87 },
              { day: "Thu", value: 94 },
              { day: "Fri", value: 89 },
              { day: "Sat", value: 42 },
              { day: "Sun", value: 25 },
            ].map((item) => (
              <div
                key={item.day}
                className="flex-1 h-full flex flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] text-slate-400">
                  {item.value}
                </span>

                <div className="w-full max-w-[28px] h-36 bg-slate-100 rounded-t-md flex items-end overflow-hidden">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${item.value}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-400">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-slate-100">
            <Legend color="bg-blue-500" label="Present" />
            <Legend color="bg-red-400" label="Absent" />
            <Legend color="bg-amber-400" label="Late" />
          </div>
        </div>

        {/* Leave Overview */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Leave Overview
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Current month
              </p>
            </div>

            <button className="text-slate-300">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background:
                  "conic-gradient(#3b82f6 0deg 180deg, #f59e0b 180deg 245deg, #10b981 245deg 310deg, #ef4444 310deg 360deg)",
              }}
            >
              <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  49
                </span>
                <span className="text-[10px] text-slate-400">
                  Total Leaves
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <LeaveLegend color="bg-blue-500" label="Approved" value="25" />
            <LeaveLegend color="bg-amber-500" label="Pending" value="9" />
            <LeaveLegend color="bg-emerald-500" label="Upcoming" value="8" />
            <LeaveLegend color="bg-red-500" label="Rejected" value="7" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-900">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Frequently used actions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center`}
                  >
                    <Icon size={17} className={action.color} />
                  </div>

                  <span className="text-[11px] font-medium text-slate-600 text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent Employees */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Recent Employees
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Recently added employees
              </p>
            </div>

            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500">
                    Employee
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                    Department
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                    Joining Date
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {employee.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <p className="text-xs text-slate-600">
                        {employee.department}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-xs text-slate-500">
                      {employee.joined}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Recent Leave Requests
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Latest employee requests
              </p>
            </div>

            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500">
                    Employee
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                    Type
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                    Duration
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {leaveRequests.map((leave) => (
                  <tr
                    key={`${leave.name}-${leave.dates}`}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                          {leave.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        <span className="text-xs font-medium text-slate-700">
                          {leave.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-xs text-slate-600">
                      {leave.type}
                    </td>

                    <td className="px-3 py-3">
                      <p className="text-xs text-slate-700">
                        {leave.dates}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {leave.days}
                      </p>
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={leave.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const MiniStat = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
      <Icon size={17} className={color} />
    </div>

    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
    <span className="text-[10px] text-slate-500">{label}</span>
  </div>
);

const LeaveLegend = ({ color, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>

    <span className="text-xs font-semibold text-slate-700">
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-600",
    Approved: "bg-emerald-50 text-emerald-600",
    Rejected: "bg-red-50 text-red-600",
  };

  const icons = {
    Pending: Clock,
    Approved: CheckCircle2,
    Rejected: XCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${styles[status]}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
};

export default HrDashboard;