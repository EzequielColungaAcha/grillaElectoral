import React from "react";
import { AddUser } from "../components/admin/adminUsers/AddUser";
import { AdminUsersList } from "../components/admin/adminUsers/AdminUsersList";
import { useQuery, useSubscription } from "@apollo/client";
import { usersQuery } from "../graphql/admin";
import {
  USER_ADDED, USER_DELETED
} from "../graphql/subscription";

export const AdminUsers = ({ users }) => {
  
  const { loading, error, data, refetch } = useQuery(usersQuery);

  const { data: userAdded } = useSubscription(USER_ADDED, {
    onData: (addedData) => {
      refetch()
    },
  });
  const { data: userDeleted } = useSubscription(USER_DELETED, {
    onData: (deletedData) => {
      refetch()
    },
  });

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error</p>;

  return (
    <div>
      <div className="flex items-center justify-center mb-5">
        <AddUser />
      </div>
      <div>
        <AdminUsersList users={data.users} />
      </div>
    </div>
  );
};
