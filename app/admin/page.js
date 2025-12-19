import DashboardClient from "./DashboardClient";
import { getDashboardStats, getActivityTimeline, getProductivityStats } from "@/lib/api/dashboard";
import { getNotesChartData } from "@/lib/api/notes";

export const dynamic = 'force-dynamic';

const AdminMainPageComponent = async () => {
  let stats, chartData, activity, productivity, error = null;

  try {
    // Fetch all dashboard data in parallel
    [stats, chartData, activity, productivity] = await Promise.all([
      getDashboardStats(),
      getNotesChartData(),
      getActivityTimeline(),
      getProductivityStats()
    ]);
  } catch (err) {
    console.error('Error loading dashboard:', err);
    error = err.message.includes('EAI_AGAIN') || err.message.includes('fetch failed') || err.message.includes('ETIMEDOUT')
      ? 'Unable to connect to database. Please check your internet connection.'
      : 'Error loading dashboard data. Please try again.';

    // Provide empty defaults
    stats = { totalNotes: 0, trashedNotes: 0, favoriteNotes: 0, unreadNotifications: 0 };
    chartData = [];
    activity = [];
    productivity = { weeklyData: [], completionRate: 0, avgNotesPerDay: 0 };
  }

  return (
    <DashboardClient
      initialStats={stats}
      initialChart={chartData}
      initialActivity={activity}
      initialProductivity={productivity}
      error={error}
    />
  );
};

export default AdminMainPageComponent;
