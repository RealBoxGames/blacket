import ModerationPage from "./index";

export default {
    path: "/staff/moderation",
    component: <ModerationPage />,
    title: `Moderation | ${import.meta.env.VITE_INFORMATION_NAME}`,
    pageHeader: "Moderation",
    sidebar: true,
    topRight: []
} as BlacketRoute;
