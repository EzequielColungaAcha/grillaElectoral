import { AddTable } from "../components/admin/adminTables/AddTable";
import { AdminTableList } from "../components/admin/adminTables/AdminTableList";
import { AffiliateCSVButton } from "../components/admin/adminTables/buttons/AffiliateCSVButton";
import { useQuery, useSubscription, NetworkStatus } from "@apollo/client";
import { tablesQuery } from "../graphql/admin";
import { TABLE_ADDED, TABLE_DELETED } from "../graphql/subscription";
import { UploadMassiveCSVButton } from "../components/admin/adminTables/buttons/UploadMassiveCSVButton";
import { useState } from "react";

export const AdminTables = () => {
  const { loading, error, data, refetch, networkStatus } = useQuery(
    tablesQuery,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: tableAdded } = useSubscription(TABLE_ADDED, {
    onData: (addedData) => {
      refetch();
    },
  });
  const { data: tableDeleted } = useSubscription(TABLE_DELETED, {
    onData: (deletedData) => {
      refetch();
    },
  });

  const [affiliateList, setAffiliateList] = useState([]);

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error</p>;

  return (
    <div>
      <div className="flex items-center justify-center mb-5 gap-3">
        <UploadMassiveCSVButton
          refetch={refetch}
          datos={Boolean(data.tables.length > 0)}
          affiliateList={affiliateList}
        />
        <AddTable />
        <AffiliateCSVButton
          datos={Boolean(data.tables.length > 0)}
          setAffiliateList={setAffiliateList}
        />
      </div>
      <div>
        <AdminTableList tables={data.tables} />
      </div>
    </div>
  );
};
