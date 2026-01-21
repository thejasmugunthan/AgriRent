import { useEffect, useState } from "react";
import { getMachine, updateMachine } from "../api/machineApi";
import AddMachine from "./AddMachine";

export default function EditMachine({ machineId }) {
  const [machine, setMachine] = useState(null);

  useEffect(() => {
    getMachine(machineId).then(res => setMachine(res.data));
  }, [machineId]);

  if (!machine) return null;

  return <AddMachine existingData={machine} isEdit />;
}
