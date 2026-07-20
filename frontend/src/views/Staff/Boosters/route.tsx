import StaffBoostersPage from "./index";

export default {
    path: "/staff/boosters",
    component: <StaffBoostersPage />,
    title: `Boosters | ${import.meta.env.VITE_INFORMATION_NAME}`,
    pageHeader: "Boosters",
    sidebar: true,
    topRight: []
} as BlacketRoute;
