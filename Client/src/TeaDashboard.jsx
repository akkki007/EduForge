import FactCheckIcon from "@mui/icons-material/FactCheck";
import EventIcon from "@mui/icons-material/Event";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import Attendance from "./Attendance";
import Marks from "./Marks";
import { useDemoRouter } from "@toolpad/core/internal";
const navigationLinks = [
  {
    segment: "marks",
    title: "Marks",
    icon: <FactCheckIcon />,
    component: <Marks key="marks" />,
    path: "/marks",
  },
  {
    segment: "attendance",
    title: "Attendance",
    icon: <EventIcon />,
    component: <Attendance key="attendance" />,
    path: "/attendance",
  },
];
function PageContent({ pathname }) {
  return (
    <>
      {navigationLinks.map((link) => {
        if (link.path === pathname) {
          return link.component;
        }
        return null;
      })}
    </>
  );
}
function TeaDashboard() {
  const router = useDemoRouter("/dashboard");

  return (
    <AppProvider navigation={navigationLinks} router={router}>
      <DashboardLayout
        sx={{
          ".css-yzjoij": { display: "none" },
          ".MuiTypography-h6": { visibility: "hidden", height: 0 },
          ".MuiTypography-h6::after": {
            content: `'Dashboard'`,
            visibility: "visible",
            display: "block",
            position: "absolute",
            top: "2dvh",
          },
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <PageContent pathname={router.pathname} />
        </div>
      </DashboardLayout>
    </AppProvider>
  );
}

export default TeaDashboard;
