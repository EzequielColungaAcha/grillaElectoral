import { Escrutinio } from './Escrutinio';
import { Estado } from './Estado';
import { useSubscription } from '@apollo/client';
import { TABLE_CHANGED } from '../graphql/subscription';
import { toast } from 'keep-react';

export function Prensa() {
  // Handle table status changes with toast for Prensa page
  const { data: tableChangedWithToast } = useSubscription(TABLE_CHANGED, {
    onData: (data) => {
      const changedTable = data.data.data.tableChange;
      if (changedTable) {
        if (changedTable.status === 'Cerrada') {
          toast.info(`Mesa ${changedTable.number} cerrada`);
        } else if (changedTable.status === 'DatosEnviados') {
          toast.info(`Mesa ${changedTable.number} - Datos enviados`);
        }
      }
    },
  });

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='md:w-1/2'>
        <Estado />
      </div>
      <div className='md:w-1/2 md:sticky md:top-0 md:h-fit'>
        <Escrutinio />
      </div>
    </div>
  );
}
