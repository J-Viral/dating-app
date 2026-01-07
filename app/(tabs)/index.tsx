import { Redirect } from "expo-router";
// import { useAuth } from "../context/AuthContext";
import { useAuth } from "../../context/AuthContext";

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/profile" />;
}
