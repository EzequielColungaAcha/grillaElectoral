import { useQuery, useSubscription } from "@apollo/client";
import { USERS_QUANTITY } from "../graphql/users";
import { useNavigate } from "react-router-dom";
import { AddUser } from "../components/admin/adminUsers/AddUser";
import { Login } from "../components/login/Login";
import { USER_ADDED } from "../graphql/subscription";

export const Register = () => {
  const { loading, error, data, refetch } = useQuery(USERS_QUANTITY);

  const navigate = useNavigate();

  const { data: userAdded } = useSubscription(USER_ADDED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  if (loading) return <span className="loader"></span>;
  if (error) {
    navigate("/");
  }

  if (data.usersQuantity == 0) {
    return (
      <div>
        <div className="flex items-center justify-center mt-10">
          <AddUser firstUser={true} />
        </div>
      </div>
    );
  } else {
    return <Login />;
  }
};
