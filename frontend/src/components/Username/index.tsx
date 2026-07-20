import { useData } from "@stores/DataStore/index";
import styles from "./username.module.scss";

import { RoleColor, UsernameProps } from "./username.d";

const ROLE_COLORS: RoleColor[] = [
    {
        key: "isSystem",
        color: "var(--secondary-color)",
        text: "SYSTEM"
    },
    {
        key: "isAi",
        color: "linear-gradient(45deg, blue, blueviolet, violet)",
        text: "AI"
    }
];

// Checked in this order so a user with multiple roles only shows the highest tag.
// These colors are fixed and not user-configurable, unlike the username color itself.
const GROUP_BADGES: { name: string; text: string; color?: string; className?: string }[] = [
    { name: "Developer", text: "DEVELOPER", color: "#7C3AED" },
    { name: "Owner", text: "OWNER", color: "#F59E0B" },
    { name: "Admin", text: "ADMIN", color: "#E02424" },
    { name: "Moderator", text: "MOD", color: "#2563EB" },
    { name: "Helper", text: "HELPER", color: "#16A34A" },
    { name: "MVP", text: "MVP", color: "linear-gradient(45deg, #FFD700, #FFA500)" },
    { name: "VIP", text: "VIP", color: "linear-gradient(45deg, #8A2BE2, #4B0082)" },
    { name: "Bot", text: "BOT", color: "#5865F2" }
];

export default function Username({ user, className, style = {}, ...props }: UsernameProps) {
    const { fontIdToName } = useData();

    if (!user) return null;
    if (!user.color) return null;

    let gradientStyle = {};
    if (user.color.includes("|")) {
        const [degrees, colors] = user.color.split("|");
        const colorArray = colors.split(",").map((color) => {
            const [hex, stop] = color.split("@");
            return stop ? `${hex} ${stop}%` : hex;
        });

        gradientStyle = {
            background: `linear-gradient(${degrees}deg, ${colorArray.join(", ")}) text`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
        };
    }

    const badges: { name: string }[] = (user as any).badges ?? [];
    const groupBadge = GROUP_BADGES.find((badge) => badges.some((b) => b.name === badge.name));
    const role = ROLE_COLORS.find((role) => (user as any)[role.key]);

    return <span
        className={`
            ${className ? `${className}` : ""}
            ${user.color === "rainbow" ? "rainbow" : ""}
        `}
        style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            ...style
        }}
        {...props}
    >
        <span style={{
            color: user.color,
            fontFamily: fontIdToName(user.fontId!),
            ...gradientStyle
        }}>
            {user.username}
        </span>

        {role && <span
            className={styles.badge}
            style={{
                background: role.color
            }}
        >
            <span>
                {role.text}
            </span>
        </span>}

        {!role && groupBadge && <span
            className={`${styles.badge} ${groupBadge.className ? styles[groupBadge.className] : ""}`}
            style={groupBadge.color ? { background: groupBadge.color } : undefined}
        >
            <span>
                {groupBadge.text}
            </span>
        </span>}
    </span >;
}
