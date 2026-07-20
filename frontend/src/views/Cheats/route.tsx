import Cheats from "./index";

export default {
    path: "/cheats",
    component: <Cheats />,
    title: `Cheats | ${import.meta.env.VITE_INFORMATION_NAME}`,
    pageHeader: "Cheats",
    sidebar: true,
    topRight: []
} as BlacketRoute;
