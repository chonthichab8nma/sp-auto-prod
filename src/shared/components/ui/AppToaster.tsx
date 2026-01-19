import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 2600,
        style: {
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 14,
          boxShadow:
            "0 8px 20px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.06)",
        },
      }}
      containerStyle={{
        top: 16,
      }}
    />
  );
}
