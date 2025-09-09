import winston, { format, transports } from 'winston';
import Log from '../models/Log.js';

const logFormat = format.printf((info) => `${info.timestamp}: ${info.message}`);

// Enhanced logger with structured JSON logging
export const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    }),
  ],
  exitOnError: false,
});

// Enhanced logging functions with structured data
export const logAction = async (
  action,
  user,
  target,
  changes = null,
  metadata = {}
) => {
  const logData = {
    timestamp: new Date(),
    level: 'info',
    message: generateLogMessage(action, user, target, changes),
    action,
    user: {
      id: user?.user_id || user?._id || user?.id || null,
      username: user?.username || 'unknown',
      name: user?.name || user?.username || 'unknown',
      role: user?.rol || user?.role || 'unknown',
    },
    target: {
      type: target?.type || 'unknown',
      id: target?.id || null,
      identifier: target?.identifier || null,
      number: target?.number || null,
      tableNumber: target?.tableNumber || null,
      order: target?.order || null,
    },
    changes: changes || null,
    metadata: {
      ...metadata,
    },
  };

  try {
    // Save to database
    const logEntry = new Log(logData);
    await logEntry.save();

    // Also log to console for development
    logger.info(logData);
  } catch (error) {
    console.error('Error saving log to database:', error);
    // Fallback to console logging
    logger.error('Failed to save log to database', {
      logData,
      error: error.message,
    });
  }
};

// Generate human-readable log messages
const generateLogMessage = (action, user, target, changes) => {
  const username = user?.name || user?.username || 'system';
  const userRole = user?.rol || user?.role || 'unknown';

  switch (action) {
    case 'PERSON_VOTE_MARKED':
      return `El usuario ${username} (${userRole}) marcó el voto de ${target?.identifier} de orden ${target?.order} en la mesa #${target?.tableNumber}`;
    case 'PERSON_VOTE_UNMARKED':
      return `El usuario ${username} (${userRole}) desmarcó el voto de ${target?.identifier} de orden ${target?.order} en la mesa #${target?.tableNumber}`;
    case 'PERSON_ADDED':
      return `El usuario ${username} (${userRole}) agregó un nuevo votante en Mesa #${target?.tableNumber}: Orden #${target?.order}, ${target?.identifier}`;
    case 'PERSON_DELETED':
      return `El usuario ${username} (${userRole}) eliminó al votante ${target?.identifier} de orden ${target?.order} en la mesa #${target?.tableNumber}`;
    case 'PERSON_UPDATED':
      return `El usuario ${username} (${userRole}) editó los datos del votante ${target?.identifier} de orden ${target?.order} en la mesa #${target?.tableNumber}`;
    case 'BULK_PERSONS_ADDED':
      return `El usuario ${username} (${userRole}) agregó ${changes?.count} votantes mediante CSV a la ${target?.identifier}`;
    case 'MASSIVE_DATA_IMPORT':
      return `El usuario ${username} (${userRole}) realizó una carga masiva de datos: ${changes?.tablesCreated} mesas y ${changes?.personsAdded} votantes`;
    case 'BULK_AFFILIATE_UPDATE':
      return `El usuario ${username} (${userRole}) actualizó ${changes?.count} afiliados de ${changes?.totalProcessed} registros procesados`;
    case 'TABLE_STATUS_CHANGED':
      return `El usuario ${username} (${userRole}) cambió el estado de la Mesa #${target?.number} a ${changes?.status}`;
    case 'TABLE_CREATED':
      return `El usuario ${username} (${userRole}) creó la Mesa #${target?.number}`;
    case 'TABLE_UPDATED':
      return `El usuario ${username} (${userRole}) editó la Mesa #${target?.number}`;
    case 'TABLE_DELETED':
      return `El usuario ${username} (${userRole}) eliminó la Mesa #${target?.number}`;
    case 'VOTES_SENT':
      return `El usuario ${username} (${userRole}) envió los votos de la Mesa #${target?.number}`;
    case 'VOTES_UPDATED':
      return `El usuario ${username} (${userRole}) actualizó los votos de la Mesa #${target?.number}`;
    case 'USER_CREATED':
      return `El usuario ${username} (${userRole}) creó el usuario ${target?.identifier}`;
    case 'USER_DELETED':
      return `El usuario ${username} (${userRole}) eliminó el usuario ${target?.identifier}`;
    case 'USER_TABLE_ASSIGNMENT_UPDATED':
      return `El usuario ${username} (${userRole}) actualizó la asignación de mesa del usuario ${target?.identifier}`;
    case 'FACTION_CONFIG_CREATED':
      return `El usuario ${username} (${userRole}) creó el partido ${target?.identifier} para ${target?.position}`;
    case 'FACTION_CONFIG_DELETED':
      return `El usuario ${username} (${userRole}) eliminó el partido ${target?.identifier}`;
    case 'FACTION_CONFIG_UPDATED':
      return `El usuario ${username} (${userRole}) actualizó el partido ${target?.identifier}`;
    default:
      return `El usuario ${username} (${userRole}) realizó la acción ${action} en ${target?.type} ${target?.identifier}`;
  }
};

// Specific logging functions for different actions
export const logPersonVote = async (user, person, voteStatus, tableNumber) => {
  await logAction(
    voteStatus ? 'PERSON_VOTE_MARKED' : 'PERSON_VOTE_UNMARKED',
    user,
    {
      type: 'person',
      id: person._id || person.id,
      identifier: `${person.lastName}, ${person.firstName} (DNI: ${person.dni})`,
      order: person.order,
      tableNumber: tableNumber,
    },
    {
      vote: voteStatus,
      previousVote: !voteStatus,
    }
  );
};

export const logPersonAdded = async (user, person, tableNumber) => {
  await logAction(
    'PERSON_ADDED',
    user,
    {
      type: 'person',
      id: person._id || person.id,
      identifier: `${person.lastName}, ${person.firstName} (DNI: ${person.dni})`,
      order: person.order,
      tableNumber: tableNumber,
    },
    {
      firstName: person.firstName,
      lastName: person.lastName,
      dni: person.dni,
      order: person.order,
    }
  );
};

export const logPersonDeleted = async (user, person) => {
  await logAction('PERSON_DELETED', user, {
    type: 'person',
    id: person._id || person.id,
    identifier: `${person.lastName}, ${person.firstName} (DNI: ${person.dni})`,
    order: person.order,
    tableNumber: person.tableNumber,
  });
};

export const logTableStatusChange = async (
  user,
  table,
  newStatus,
  oldStatus
) => {
  await logAction(
    'TABLE_STATUS_CHANGED',
    user,
    {
      type: 'table',
      id: table._id || table.id,
      identifier: `Mesa #${table.number}`,
      number: table.number,
    },
    {
      status: newStatus,
      previousStatus: oldStatus,
    }
  );
};

export const logVotesSent = async (user, table, votes) => {
  await logAction(
    'VOTES_SENT',
    user,
    {
      type: 'table',
      id: table._id || table.id,
      identifier: `Mesa #${table.number}`,
      number: table.number,
    },
    {
      votes: votes.map((vote) => ({
        faction: vote.name,
        votes: vote.votes,
      })),
    }
  );
};

export const logVotesUpdated = async (user, table, votes) => {
  await logAction(
    'VOTES_UPDATED',
    user,
    {
      type: 'table',
      id: table._id || table.id,
      identifier: `Mesa #${table.number}`,
      number: table.number,
    },
    {
      votes: votes.map((vote) => ({
        faction: vote.name,
        votes: vote.votes,
      })),
    }
  );
};

export const logUserAction = async (
  action,
  performedBy,
  targetUser,
  changes = null
) => {
  await logAction(
    action,
    performedBy,
    {
      type: 'user',
      id: targetUser._id || targetUser.id,
      identifier: targetUser.username,
      role: targetUser.rol || targetUser.role,
    },
    changes
  );
};

export const logTableAction = async (action, user, table, changes = null) => {
  await logAction(
    action,
    user,
    {
      type: 'table',
      id: table._id || table.id,
      identifier: `Mesa #${table.number}`,
      number: table.number,
    },
    changes
  );
};

export const logFactionAction = async (
  action,
  user,
  faction,
  changes = null
) => {
  await logAction(
    action,
    user,
    {
      type: 'faction',
      id: faction._id || faction.id,
      identifier: faction.name,
      position: faction.position,
    },
    changes
  );
};
