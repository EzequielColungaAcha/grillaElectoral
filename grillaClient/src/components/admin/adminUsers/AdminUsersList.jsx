import { AdminUsersCard } from "./AdminUsersCard.jsx";

export const AdminUsersList = ({ users }) => {
  return (
    <div className="h-full w-full px-5 flex flex-col items-center">
      {users.map((userD) => (
        <AdminUsersCard userD={userD} key={userD._id} />
      ))}
    </div>
  );
};
