import SettingsInterface from "@/components/SettingsInterface";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تنظیمات | زنترو",
    description: "مدیریت حساب کاربری و تنظیمات شخصی",
};

export default function SettingsPage() {
    return <SettingsInterface />;
}
