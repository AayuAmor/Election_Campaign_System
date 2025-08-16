import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useVoting } from "../context/VotingContext";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

function ResultsChart() {
  const { state } = useVoting();

  // Filter out any invalid candidates and clean data
  const validCandidates = state.candidates.filter(
    (candidate) =>
      candidate.name &&
      candidate.name.trim() !== "" &&
      typeof candidate.votes === "number"
  );

  const chartData = validCandidates.map((candidate, index) => ({
    name:
      candidate.name.length > 10
        ? candidate.name.substring(0, 10) + "..."
        : candidate.name,
    fullName: candidate.name,
    votes: candidate.votes,
    color: COLORS[index % COLORS.length],
  }));

  const totalVotes = validCandidates.reduce(
    (sum, candidate) => sum + candidate.votes,
    0
  );

  const pieData = validCandidates.map((candidate, index) => ({
    name:
      candidate.name.length > 8
        ? candidate.name.substring(0, 8) + "..."
        : candidate.name,
    fullName: candidate.name,
    value: candidate.votes,
    percentage:
      totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {validCandidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-gray-900 truncate"
                  title={candidate.name}
                >
                  {candidate.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {candidate.votes}
                  </span>
                  <span className="text-sm text-gray-500">
                    (
                    {totalVotes > 0
                      ? ((candidate.votes / totalVotes) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {totalVotes > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vote Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    props.payload.fullName,
                  ]}
                  labelFormatter={(label, payload) =>
                    payload && payload[0] ? payload[0].payload.fullName : label
                  }
                />
                <Bar dataKey="votes" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vote Share
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ fullName, percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    props.payload.fullName,
                  ]}
                />
                <Legend
                  formatter={(value, entry) => entry.payload.fullName}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-gray-400 mb-4">
            <BarChart className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No votes yet
          </h3>
          <p className="text-gray-600">Start voting to see results here.</p>
        </div>
      )}

      {/* Voting History */}
      {state.votingHistory && state.votingHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Voting Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voter Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voted For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.votingHistory
                  .slice(-10)
                  .reverse()
                  .map((vote, index) => {
                    const candidate = validCandidates.find(
                      (c) => c.id === vote.candidateId
                    );
                    const voterNumber = state.votingHistory.length - index;
                    return (
                      <tr key={vote.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {voterNumber}.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vote.voterName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate?.name || "Unknown Candidate"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vote.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsChart;
