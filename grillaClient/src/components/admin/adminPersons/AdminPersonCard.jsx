import { useSubscription } from "@apollo/client";
import { PERSON_VOTED } from "../../../graphql/subscription";
import { DeletePersonButton } from "./buttons/DeletePersonButton";
import { EditPersonButton } from "./buttons/EditPersonButton";

export function AdminPersonCard({ person }) {
  const { data: personVoted } = useSubscription(PERSON_VOTED);

  return person.vote == true ? (
    <tr className="mb-2 items-center text-center border-2 border-white">
      <td className="bg-green-800 px-1">{person.order}</td>
      <td className="bg-green-800 px-1 uppercase">{person.lastName}</td>
      <td className="bg-green-800 px-1 uppercase">{person.firstName}</td>
      <td className="bg-green-800 px-1">{person.dni}</td>
      <td className="bg-green-800 px-1 my-2 py-1">Votó</td>
      <td className="flex justify-evenly items-center">
        <EditPersonButton person={person} />
        <DeletePersonButton person={person} />
      </td>
    </tr>
  ) : (
    <tr className="mb-2 items-center text-center border-2 border-white">
      <td className="bg-red-800 px-1">{person.order}</td>
      <td className="bg-red-800 px-1 uppercase">{person.lastName}</td>
      <td className="bg-red-800 px-1 uppercase">{person.firstName}</td>
      <td className="bg-red-800 px-1">{person.dni}</td>
      <td className="bg-red-800 px-1 my-2 py-1">No votó</td>
      <td className="flex justify-evenly items-center">
        <EditPersonButton person={person} />
        <DeletePersonButton person={person} />
      </td>
    </tr>
  );
}
