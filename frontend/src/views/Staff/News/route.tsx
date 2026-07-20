import StaffNewsPage from "./index";

export default {
    path: "/staff/news",
    component: <StaffNewsPage />,
    title: `News | ${import.meta.env.VITE_INFORMATION_NAME}`,
    pageHeader: "News",
    sidebar: true,
    topRight: []
} as BlacketRoute;
