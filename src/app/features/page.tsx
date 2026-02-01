import FeaturesInterface from "@/components/FeaturesInterface";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ویژگی‌ها | زنترو",
    description: "آشنایی با امکانات و ویژگی‌های پلتفرم مدیریت وظایف هوشمند زنترو",
};

export default function FeaturesPage() {
    return <FeaturesInterface />;
}
