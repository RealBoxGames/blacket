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

// Checked in this order so an Owner who also holds MVP/VIP only shows the highest tag.
// These colors are fixed and not user-configurable, unlike the username color itself.
const GROUP_BADGES: { name: string; text: string; color?: string; className?: string }[] = [
    { name: "Owner", text: "OWNER", className: "rainbowBadge" },
    { name: "MVP", text: "MVP", color: "linear-gradient(45deg, #FFD700, #FFA500)" },
    { name: "VIP", text: "VIP", color: "linear-gradient(45deg, #8A2BE2, #4B0082)" }
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
