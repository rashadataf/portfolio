import { NavLink, Service } from "../types";
import {
    mobile,
    open_source,
    web,
    back_end
} from "../assets";

export const navLinks: NavLink[] = [
    {
        id: "about",
        title: "About",
    },
    {
        id: "work",
        title: "Work",
    },
    {
        id: "contact",
        title: "Contact",
    },
];

export const services: Service[] = [
    {
        title: "Web Developer",
        icon: web,
    },
    {
        title: "React Native Developer",
        icon: mobile,
    },
    {
        title: "Backend Developer",
        icon: back_end,
    },
    {
        title: "Open Source Contributer",
        icon: open_source,
    },
];