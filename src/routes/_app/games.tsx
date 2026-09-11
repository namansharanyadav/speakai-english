import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/games")({ component: GamesLayout });

function GamesLayout() {
  return <Outlet />;
}
