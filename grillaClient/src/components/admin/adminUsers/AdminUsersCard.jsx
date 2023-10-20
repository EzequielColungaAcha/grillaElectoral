import { DeleteUserButton } from "./buttons/DeleteUserButton";

export const AdminUsersCard = (userD) => {
  return (
    <div className="flex gap-10 w-full justify-center">
      <div className="flex justify-between bg-zinc-800 w-full rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 items-center max-w-2xl">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">
            Usuario: {userD.userD.username}
          </h2>
          <h2 className="text-xl font-medium">
            Nombre/Apellido: {userD.userD.name}
          </h2>
          <h2 className="text-xl font-medium">
            Rol: <span className="capitalize">{userD.userD.rol}</span>
          </h2>
        </div>
        <div className="flex gap-5 h-fit">
          <DeleteUserButton userD={userD.userD} />
        </div>
      </div>
    </div>
  );
};
