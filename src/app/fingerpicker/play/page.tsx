import type { Metadata } from "next";
import FingerPicker from "./FingerPicker";

export function generateMetadata(): Metadata {
  return {
    title: "Finger Picker",
    description:
      "Everyone puts a finger on the screen. After a moment, one finger is picked — or the group is split into teams.",
  };
}

export default function FingerPickerPage() {
  return <FingerPicker />;
}
