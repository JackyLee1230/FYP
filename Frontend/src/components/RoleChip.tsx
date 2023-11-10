import { Chip, Stack } from "@mui/material";
import React from "react";

export function AdminChip() {
  return <Chip label="ADMIN" color="error"></Chip>;
}

export function DeveloperChip() {
  return <Chip label="DEVELOPER" color="secondary"></Chip>;
}

export function UserChip() {
  return <Chip label="USER" color="primary"></Chip>;
}

export default function RoleChip({
  role,
  direction,
  includeUser = true,
}: {
  role: string[];
  direction: "row" | "column";
  includeUser: boolean;
}) {
  // switch (role) {
  //   case "ADMIN":
  //     return <AdminChip />;
  //   case "DEVELOPER":
  //     return <DeveloperChip />;
  //   default:
  //     return <UserChip />;
  // }
  const newRole = includeUser ? role : role.filter((r) => r !== "USER");
  return (
    <>
      <Stack direction={direction} spacing={0.5}>
        {newRole.sort().map((r) => {
          switch (r) {
            case "ADMIN":
              return <AdminChip />;
            case "DEVELOPER":
              return <DeveloperChip />;
            default:
              return <UserChip />;
          }
        })}
      </Stack>
    </>
  );
}

