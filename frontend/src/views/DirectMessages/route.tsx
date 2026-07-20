import DirectMessages from "./index";

export default {
    path: "/direct-messages/:userId?",
    component: <DirectMessages />,
    title: `Direct Messages | ${import.meta.env.VITE_INFORMATION_NAME}`,
    pageHeader: "Direct Messages",
    sidebar: true,
    topRight: []
} as BlacketRoute;
