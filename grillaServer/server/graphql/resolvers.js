// * Importing required models
import Table from '../models/Table.js';
import Person from '../models/Person.js';
import FactionConfig from '../models/FactionConfig.js';
import Faction from '../models/Faction.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';

import {
  logger,
  logPersonVote,
  logPersonAdded,
  logPersonDeleted,
  logTableStatusChange,
  logVotesSent,
  logVotesUpdated,
  logUserAction,
  logTableAction,
  logFactionAction,
  logAction,
} from '../utils/logger.js';

import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
import fs from 'fs';
import path from 'path';

export const resolvers = {
  Query: {
    // * Query resolvers for Users
    users: async () => User.find(),
    // * ...

    // * Query resolvers for Table
    tables: async () => {
      // Only use this for admin purposes - prefer tablesWithCounts for performance
      return await Table.find().sort({ number: 1 });
    },

    tablesForFiscal: async (_, { tableId }) => {
      if (tableId) {
        // Return only the assigned table
        const table = await Table.findById(tableId);
        return table ? [table] : [];
      } else {
        // Return all tables for Fiscal General
        return await Table.find().sort({ number: 1 });
      }
    },
    tablesWithCounts: async () => {
      const tables = await Table.aggregate([
        {
          $lookup: {
            from: 'people',
            localField: '_id',
            foreignField: 'tableId',
            as: 'persons',
          },
        },
        {
          $lookup: {
            from: 'factions',
            localField: '_id',
            foreignField: 'tableId',
            as: 'factions',
          },
        },
        {
          $addFields: {
            totalPersons: { $size: '$persons' },
            voted: {
              $size: {
                $filter: {
                  input: '$persons',
                  cond: { $eq: ['$$this.vote', true] },
                },
              },
            },
            factionsCount: { $size: '$factions' },
          },
        },
        {
          $project: {
            _id: 1,
            number: 1,
            description: 1,
            status: 1,
            totalPersons: 1,
            voted: 1,
            factionsCount: 1,
          },
        },
        { $sort: { number: 1 } },
      ]);
      return tables;
    },

    tablesPaginated: async (_, { limit = 20, offset = 0, search }) => {
      const matchStage = search
        ? {
            $or: [
              { number: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'people',
            localField: '_id',
            foreignField: 'tableId',
            as: 'persons',
          },
        },
        {
          $lookup: {
            from: 'factions',
            localField: '_id',
            foreignField: 'tableId',
            as: 'factions',
          },
        },
        {
          $addFields: {
            totalPersons: { $size: '$persons' },
            voted: {
              $size: {
                $filter: {
                  input: '$persons',
                  cond: { $eq: ['$$this.vote', true] },
                },
              },
            },
            factionsCount: { $size: '$factions' },
          },
        },
        {
          $project: {
            _id: 1,
            number: 1,
            description: 1,
            status: 1,
            totalPersons: 1,
            voted: 1,
            factionsCount: 1,
          },
        },
        { $sort: { number: 1 } },
      ];

      const [tables, totalCount] = await Promise.all([
        Table.aggregate([...pipeline, { $skip: offset }, { $limit: limit }]),
        Table.aggregate([...pipeline, { $count: 'total' }]).then(
          (result) => result[0]?.total || 0
        ),
      ]);

      return {
        tables,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    },

    table: async (_, { _id }) => await Table.findById(_id),
    // * ...

    // * Query resolvers for Person
    persons: async (
      _,
      { limit = 50, offset = 0, tableNumber, search, vote, affiliate }
    ) => {
      const filter = {};

      if (tableNumber) filter.tableNumber = tableNumber;
      if (vote !== undefined) filter.vote = vote;
      if (affiliate !== undefined) filter.affiliate = affiliate;

      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { dni: searchRegex },
        ];
      }

      const [persons, totalCount] = await Promise.all([
        Person.find(filter)
          .sort({ tableNumber: 1, order: 1 })
          .skip(offset)
          .limit(limit)
          .lean(), // Use lean() for better performance when we don't need full Mongoose documents
        Person.countDocuments(filter),
      ]);

      return {
        persons,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    },

    personsCount: async (_, { tableNumber, search, vote, affiliate }) => {
      const filter = {};

      if (tableNumber) filter.tableNumber = tableNumber;
      if (vote !== undefined) filter.vote = vote;
      if (affiliate !== undefined) filter.affiliate = affiliate;

      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { dni: searchRegex },
        ];
      }

      return await Person.countDocuments(filter);
    },

    person: async (_, { _id }) => await Person.findById(_id),

    // * Quantity
    personTotal: async () => await Person.countDocuments(),
    personVoted: async () => await Person.countDocuments({ vote: true }),
    personNoVoted: async () => await Person.countDocuments({ vote: false }),
    votedPercent: async () =>
      ((await Person.countDocuments({ vote: true })) /
        (await Person.countDocuments())) *
      100,

    usersQuantity: async () => await User.countDocuments(),

    tableTotal: async (_, { _id }) =>
      await Person.countDocuments({ tableId: _id }),
    tableVoteTotal: async (_, { _id }) =>
      await Person.countDocuments({ tableId: _id, vote: true }),
    tableNoVoteTotal: async (_, { _id }) =>
      await Person.countDocuments({ tableId: _id, vote: false }),
    tableVoteTotalPercent: async (_, { _id }) =>
      (
        ((await Person.countDocuments({ tableId: _id, vote: true })) /
          (await Person.countDocuments({ tableId: _id }))) *
        100
      ).toFixed(2),

    totalAbiertaStatus: async () =>
      await Table.countDocuments({ status: 'Abierta' }),
    totalCerradaStatus: async () =>
      await Table.countDocuments({ status: 'Cerrada' }),
    totalDatosEnviadosStatus: async () =>
      await Table.countDocuments({ status: 'DatosEnviados' }),

    // * ...

    // * Query resolvers for Faction Config
    factionsConfig: async () => await FactionConfig.find(),
    anyFaction: async () => Faction.countDocuments(),

    factionChartJS: async () => {
      // Use aggregation for better performance
      const result = await FactionConfig.aggregate([
        {
          $lookup: {
            from: 'factions',
            localField: '_id',
            foreignField: 'configId',
            as: 'factions',
          },
        },
        {
          $addFields: {
            votes: { $sum: '$factions.votes' },
            percentage: 0,
            seats: 0,
          },
        },
        {
          $project: {
            id: { $toString: '$_id' },
            name: 1,
            color: 1,
            position: 1,
            votes: 1,
            percentage: 1,
            seats: 1,
          },
        },
      ]);

      return JSON.stringify(result);
    },

    // * Query resolver for logs
    logs: async (_, { limit = 50, offset = 0, action, startDate, endDate }) => {
      try {
        const logFilePath = path.join(
          process.cwd(),
          'server',
          'grillaLogs.log'
        );

        if (!fs.existsSync(logFilePath)) {
          return {
            logs: [],
            totalCount: 0,
            hasMore: false,
          };
        }

        const logContent = fs.readFileSync(logFilePath, 'utf8');
        const logLines = logContent
          .trim()
          .split('\n')
          .filter((line) => line.trim());

        // Parse and filter logs
        let parsedLogs = [];

        for (let i = logLines.length - 1; i >= 0; i--) {
          // Reverse order (newest first)
          try {
            const logEntry = JSON.parse(logLines[i]);

            // Apply filters
            if (action && logEntry.metadata?.action !== action) continue;

            if (startDate) {
              const logDate = new Date(logEntry.timestamp);
              const filterStartDate = new Date(startDate);
              if (logDate < filterStartDate) continue;
            }

            if (endDate) {
              const logDate = new Date(logEntry.timestamp);
              const filterEndDate = new Date(endDate);
              filterEndDate.setHours(23, 59, 59, 999); // End of day
              if (logDate > filterEndDate) continue;
            }

            // Transform log entry to match GraphQL schema
            const transformedLog = {
              id: `${logEntry.timestamp}-${i}`,
              timestamp: logEntry.timestamp,
              level: logEntry.level || 'info',
              message: logEntry.message || '',
              action: logEntry.metadata?.action || null,
              user: logEntry.metadata?.user
                ? {
                    id: logEntry.metadata.user.id,
                    username: logEntry.metadata.user.username,
                    role: logEntry.metadata.user.role,
                    name: logEntry.metadata.user.name,
                  }
                : null,
              target: logEntry.metadata?.target
                ? {
                    type: logEntry.metadata.target.type,
                    id: logEntry.metadata.target.id,
                    identifier: logEntry.metadata.target.identifier,
                    number: logEntry.metadata.target.number,
                  }
                : null,
              changes: logEntry.metadata?.changes
                ? JSON.stringify(logEntry.metadata.changes)
                : null,
              metadata: logEntry.metadata
                ? JSON.stringify(logEntry.metadata)
                : null,
            };

            parsedLogs.push(transformedLog);
          } catch (parseError) {
            // Skip malformed log entries
            continue;
          }
        }

        const totalCount = parsedLogs.length;
        const paginatedLogs = parsedLogs.slice(offset, offset + limit);
        const hasMore = offset + limit < totalCount;

        return {
          logs: paginatedLogs,
          totalCount,
          hasMore,
        };
      } catch (error) {
        console.error('Error reading logs:', error);
        return {
          logs: [],
          totalCount: 0,
          hasMore: false,
        };
      }
    },
    // * ...
  },

  Mutation: {
    // * Mutation for Auth Register
    registerUser: async (
      _,
      { registerInput: { username, name, password, rol, assignedTableId } },
      context
    ) => {
      const oldUser = await User.findOne({ username });
      if (oldUser) {
        throw new Error('El Usuario ya existe!');
      }
      var encryptedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        name,
        rol,
        assignedTableId: assignedTableId || null,
        password: encryptedPassword,
      });
      const token = Jwt.sign(
        {
          user_id: newUser._id,
          username,
          name,
          rol,
        },
        'UNFASE_STRINGYFIED',
        {
          expiresIn: '24h',
        }
      );
      newUser.token = token;
      const savedUser = await newUser.save();
      pubsub.publish('USER_ADDED', { userAdded: savedUser });

      // Log user creation
      const performer = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logUserAction('USER_CREATED', performer, savedUser, {
        username: savedUser.username,
        name: savedUser.name,
        rol: savedUser.rol,
      });

      return savedUser;
    },

    updateUserTableAssignment: async (_, { _id, assignedTableId }, context) => {
      // Get the old user data before update for logging
      const oldUser = await User.findById(_id).populate('assignedTableId');

      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { assignedTableId: assignedTableId || null },
        { new: true }
      ).populate('assignedTableId');

      if (!updatedUser) throw new Error('User not found');

      // Create the user object with proper assignedTable structure
      const userWithTable = {
        ...updatedUser.toObject(),
        assignedTable: updatedUser.assignedTableId
          ? {
              _id: updatedUser.assignedTableId._id,
              number: updatedUser.assignedTableId.number,
            }
          : null,
      };

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };

      // Prepare the changes object with before/after values
      const changes = {
        assignedTable: {
          old: oldUser?.assignedTableId
            ? `Mesa ${oldUser.assignedTableId.number}`
            : 'Fiscal General (todas las mesas)',
          new: updatedUser.assignedTableId
            ? `Mesa ${updatedUser.assignedTableId.number}`
            : 'Fiscal General (todas las mesas)',
        },
      };

      logUserAction(
        'USER_TABLE_ASSIGNMENT_UPDATED',
        user,
        updatedUser,
        changes
      );

      // Publish subscription for table assignment change
      await pubsub.publish('USER_TABLE_ASSIGNMENT_UPDATED', {
        userTableAssignmentUpdated: userWithTable,
      });

      return userWithTable;
    },

    loginUser: async (_, { loginInput: { username, password } }) => {
      const user = await User.findOne({ username }).populate('assignedTableId');
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = Jwt.sign(
          {
            user_id: user._id,
            username,
            name: user.name,
            rol: user.rol,
            assignedTable: user.assignedTableId
              ? {
                  _id: user.assignedTableId._id,
                  number: user.assignedTableId.number,
                }
              : null,
          },
          'UNFASE_STRINGYFIED',
          {
            expiresIn: '24h',
          }
        );
        user.token = token;
        return user;
      } else {
        throw new Error('Incorrect Usuario o Contraseña');
      }
    },

    deleteUser: async (_, { _id }, context) => {
      const deletedUser = await User.findByIdAndDelete(_id);
      if (!deletedUser) throw new Error('User not found');

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logUserAction('USER_DELETED', user, deletedUser);

      await pubsub.publish('USER_DELETED', {
        userDeleted: deletedUser,
      });
      return deletedUser;
    },
    // * ...

    // * Mutation CUD resolvers for Table

    createTable: async (_, args, context) => {
      const table = new Table({
        number: args.number,
        description: args.description,
        status: args.status,
      });
      const savedTable = await table.save();
      pubsub.publish('TABLE_ADDED', { tableAdded: savedTable });

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logTableAction('TABLE_CREATED', user, savedTable, {
        number: savedTable.number,
        description: savedTable.description,
        status: savedTable.status,
      });

      return savedTable;
    },

    deleteTable: async (_, { _id }, context) => {
      const deletedTable = await Table.findByIdAndDelete(_id);
      const deleteTablePersons = await Person.deleteMany({ tableId: _id });
      const deleteFactions = await Faction.deleteMany({ tableId: _id });
      if (!deletedTable) throw new Error('Table not found');

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logTableAction('TABLE_DELETED', user, deletedTable);

      pubsub.publish('TABLE_DELETED', { tableDeleted: deletedTable });
      return deletedTable;
    },

    updateTable: async (_, args, context) => {
      const oldTable = await Table.findById(args._id);
      const updatedTable = await Table.findByIdAndUpdate(args._id, args, {
        new: true,
      });

      // Get user from context first, then fallback to args
      const user = context?.user || {
        username: args.userName || 'system',
        name: args.userName || 'system',
        rol: args.userRol || 'system',
      };

      if (oldTable && oldTable.status !== args.status) {
        logTableStatusChange(user, updatedTable, args.status, oldTable.status);
      } else if (oldTable) {
        // Log other table updates (number, description)
        const changes = {};
        if (oldTable.number !== args.number)
          changes.number = { old: oldTable.number, new: args.number };
        if (oldTable.description !== args.description)
          changes.description = {
            old: oldTable.description,
            new: args.description,
          };

        if (Object.keys(changes).length > 0) {
          logTableAction('TABLE_UPDATED', user, updatedTable, changes);
        }
      }

      if (!updatedTable) throw new Error('Table not found');
      pubsub.publish('TABLE_CHANGED', { tableChange: updatedTable });
      return updatedTable;
    },

    // * ...

    // * Mutation CUD resolvers for Faction
    createFactionConfig: async (_, { name, color, position }, context) => {
      const factionConfig = new FactionConfig({
        name,
        color,
        position,
      });
      const factionConfigSaved = await factionConfig.save();
      pubsub.publish('FACTION_CONFIG_ADDED', {
        factionConfigAdded: factionConfigSaved,
      });

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logFactionAction('FACTION_CONFIG_CREATED', user, factionConfigSaved, {
        name: factionConfigSaved.name,
        color: factionConfigSaved.color,
        position: factionConfigSaved.position,
      });

      return factionConfigSaved;
    },

    deleteFactionConfig: async (_, { _id }, context) => {
      const deletedFactionConfig = await FactionConfig.findByIdAndDelete(_id);
      if (!deletedFactionConfig) throw new Error('Faction Config not found');

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logFactionAction('FACTION_CONFIG_DELETED', user, deletedFactionConfig);

      pubsub.publish('FACTION_CONFIG_DELETED', {
        factionConfigDeleted: deletedFactionConfig,
      });
      return deletedFactionConfig;
    },

    updateFactionConfig: async (_, args, context) => {
      const oldFactionConfig = await FactionConfig.findById(args._id);
      const updatedFactionConfig = await FactionConfig.findByIdAndUpdate(
        args._id,
        args,
        {
          new: true,
        }
      );
      if (!updatedFactionConfig) throw new Error('FactionConfig not found');
      pubsub.publish('FACTION_CONFIG_UPDATE', {
        factionConfigUpdate: updatedFactionConfig,
      });

      // Log the changes made
      const changes = {};
      if (oldFactionConfig) {
        if (oldFactionConfig.name !== args.name) {
          changes.name = { old: oldFactionConfig.name, new: args.name };
        }
        if (oldFactionConfig.color !== args.color) {
          changes.color = { old: oldFactionConfig.color, new: args.color };
        }
        if (oldFactionConfig.position !== args.position) {
          changes.position = {
            old: oldFactionConfig.position,
            new: args.position,
          };
        }
      }

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logFactionAction(
        'FACTION_CONFIG_UPDATED',
        user,
        updatedFactionConfig,
        changes
      );

      return updatedFactionConfig;
    },

    createFaction: async (_, { configId, votes, tableId }) => {
      const tableFound = await Table.findById(tableId, {
        new: true,
      });

      const configFound = await FactionConfig.findById(configId, {
        new: true,
      });

      if (!tableFound) throw new Error('Table not found');
      if (!configFound) throw new Error('Config not found');

      const faction = new Faction({
        configId,
        votes,
        tableId,
      });
      const factionSaved = await faction.save();
      return factionSaved;
    },

    updateFaction: async (_, args) => {
      const updatedFaction = await Faction.findByIdAndUpdate(args._id, args, {
        new: true,
      });
      if (!updatedFaction) throw new Error('Faction not found');
      return updatedFaction;
    },

    deleteFaction: async (_, { _id, status }) => {
      const getDeletedFactions = await Faction.find({ tableId: _id });
      const deleteFactions = await Faction.deleteMany({ tableId: _id });
      if (!deleteFactions) throw new Error('Table without Factions not found');
      pubsub.publish('FACTION_DELETE', {
        factionDeleted: getDeletedFactions,
      });
      const updatedTable = await Table.findByIdAndUpdate(
        _id,
        { status },
        {
          new: true,
        }
      );
      if (!updatedTable) throw new Error('Table not found');
      pubsub.publish('TABLE_CHANGED', { tableChange: updatedTable });
      return deleteFactions;
    },

    setMultipleFactionRecord: async (
      _,
      { data, userName, userRol, tableNumber },
      context
    ) => {
      let factionList = [];
      data.map(async (faction) => {
        const tableFound = await Table.findById(faction.table, {
          new: true,
        });

        const configFound = await FactionConfig.findById(faction.config, {
          new: true,
        });

        if (!tableFound) throw new Error('Table not found');
        if (!configFound) throw new Error('Faction Config not found');

        const factionObj = new Faction({
          configId: faction.config,
          votes: faction.votes,
          tableId: faction.table,
        });
        const factionSaved = await factionObj.save();
        factionList.push(factionSaved);
      });

      // Get table info for logging
      const table = await Table.findById(data[0]?.table);
      const user = context?.user || {
        username: userName || 'system',
        name: userName || 'system',
        rol: userRol || 'system',
      };

      if (table) {
        logVotesSent(user, table, data);
      }

      pubsub.publish('FACTION_VOTES_SEND', {
        factionVotesSend: `Faction Votes Set`,
      });
      return `Faction Records Saved`;
    },

    updateMultipleFactionRecord: async (
      _,
      { data, userName, userRol, tableNumber },
      context
    ) => {
      let factionList = [];
      data.map(async (faction) => {
        const updatedFaction = await Faction.findByIdAndUpdate(
          faction._id,
          faction,
          {
            new: true,
          }
        );
        if (!updatedFaction) throw new Error('Faction not found');

        factionList.push(updatedFaction);
      });

      // Get table info for logging
      const user = context?.user || {
        username: userName || 'system',
        name: userName || 'system',
        rol: userRol || 'system',
      };

      if (data.length > 0) {
        const firstFaction = await Faction.findById(data[0]._id).populate(
          'tableId'
        );
        if (firstFaction && firstFaction.tableId) {
          logVotesUpdated(user, firstFaction.tableId, data);
        }
      }

      pubsub.publish('FACTION_VOTES_UPDATE', {
        factionVotesUpdate: `Faction Votes Updated`,
      });
      return `Factions Updated Successfully`;
    },
    // * ...

    setMultipleAffiliate: async (_, { data }, context) => {
      let updatedCount = 0;
      data.map(async (record) => {
        const affiliateRecord = await Person.findOne({ dni: record.dni });
        if (affiliateRecord) {
          await Person.findByIdAndUpdate(affiliateRecord._id, {
            affiliate: true,
          });
          updatedCount++;
        }
      });

      // Log affiliate update
      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logAction(
        'BULK_AFFILIATE_UPDATE',
        user,
        {
          type: 'system',
          identifier: 'Sistema',
        },
        {
          count: updatedCount,
          totalProcessed: data.length,
        }
      );

      return `Records Updated Successfully`;
    },
    // * ...

    // * Mutation CUD resolvers for Person

    createPerson: async (_, args, context) => {
      const tableFound = await Table.findById(args.tableId, {
        new: true,
      });

      if (!tableFound) throw new Error('Table not found');

      const person = new Person({
        firstName: args.firstName,
        lastName: args.lastName,
        dni: args.dni,
        vote: args.vote,
        order: args.order,
        address: args.address,
        message: args.message,
        affiliate: args.affiliate,
        referer: args.referer,
        tableId: args.tableId,
        tableNumber: args.tableNumber,
      });
      const personSaved = await person.save();

      // Get user from context first, then fallback to args
      const user = context?.user || {
        username: args.userName || 'system',
        name: args.userName || 'system',
        rol: args.userRol || 'system',
      };

      logPersonAdded(user, personSaved, args.tableNumber);

      pubsub.publish('PERSON_ADDED', { personAdded: personSaved });
      return personSaved;
    },

    setMultipleRecord: async (_, { data }, context) => {
      let personList = [];
      data.map(async (person) => {
        const tableFound = await Table.findById(person.table, {
          new: true,
        });

        if (!tableFound) throw new Error('Table not found');

        const personObj = new Person({
          firstName: person.firstName,
          lastName: person.lastName,
          dni: person.dni,
          vote: person.vote,
          order: person.order,
          address: person.address,
          message: person.message,
          affiliate: person.affiliate,
          referer: person.referer,
          tableId: person.table,
          tableNumber: person.tableNumber,
        });
        const personSaved = await personObj.save();
        personList.push(personSaved);
      });

      // Log bulk person addition
      if (data.length > 0) {
        const tableNumber = data[0].tableNumber;
        const user = context?.user || {
          username: 'system',
          name: 'system',
          rol: 'system',
        };
        logAction(
          'BULK_PERSONS_ADDED',
          user,
          {
            type: 'table',
            id: data[0].table,
            identifier: `Mesa #${tableNumber}`,
            number: tableNumber,
          },
          {
            count: data.length,
            persons: data.map(
              (p) => `${p.lastName}, ${p.firstName} (${p.dni})`
            ),
          }
        );
      }

      pubsub.publish('MULTIPLE_PERSONS_ADDED', {
        multiplePersonsAdded: `${personList}`,
      });
      return `${personList}`;
    },

    setMassiveRecord: async (_, { data }, context) => {
      const tableNumbers = data.map(({ tableNumber }) => tableNumber);
      const tablesUnique = [...new Set(tableNumbers)];
      await Table.insertMany(
        tablesUnique.map((number) => {
          return {
            number,
            status: 'Abierta',
            description: '',
          };
        })
      )
        .then(async () => {
          const tables = await Table.find().sort({ number: 1 });
          tables.map(async (table) => {
            await Person.insertMany(
              data
                .map((person) => {
                  if (person.tableNumber == table.number) {
                    return {
                      firstName: person.firstName,
                      lastName: person.lastName,
                      dni: person.dni.toString(),
                      vote: false,
                      order: person.order,
                      address: person.address,
                      message: '',
                      affiliate: person.affiliate,
                      referer: person.referer,
                      tableId: table._id,
                      tableNumber: person.tableNumber,
                    };
                  }
                })
                .filter(Boolean),
              { ordered: true }
            );
          });
        })
        .then(pubsub.publish('DATA_SAVED', { data: 'Total Data Saved' }));

      // Log massive data import
      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logAction(
        'MASSIVE_DATA_IMPORT',
        user,
        {
          type: 'system',
          identifier: 'Sistema',
        },
        {
          tablesCreated: tablesUnique.length,
          personsAdded: data.length,
          tableNumbers: tablesUnique,
        }
      );
    },

    deletePerson: async (_, { _id }, context) => {
      const deletedPerson = await Person.findByIdAndDelete(_id, {
        new: true,
      });
      if (!deletedPerson) throw new Error('Person not found');

      const user = context?.user || {
        username: 'system',
        name: 'system',
        rol: 'system',
      };
      logPersonDeleted(user, deletedPerson);

      pubsub.publish('PERSON_DELETED', { personDeleted: deletedPerson });
      return deletedPerson;
    },

    updatePerson: async (_, args, context) => {
      const oldPerson = await Person.findById(args._id);
      if (!oldPerson) throw new Error('Person not found');

      const updatedPerson = await Person.findByIdAndUpdate(args._id, args, {
        new: true,
      });
      if (!updatedPerson) throw new Error('Person not found');

      // Ensure we have a valid user object
      const user = context?.user
        ? {
            username: context.user.username || 'system',
            name: context.user.name || context.user.username || 'system',
            rol: context.user.rol || 'system',
          }
        : {
            username: args.userName || 'system',
            name: args.userName || 'system',
            rol: args.userRol || 'system',
          };

      // Initialize changes object
      let changes = {};
      let hasNonVoteChanges = false;
      let isVoteOnlyUpdate = false;

      // Check if this is a vote-only update (only vote, userName, userRol, tableNumber are provided)
      const providedArgs = Object.keys(args).filter(
        (key) => args[key] !== undefined && key !== '_id'
      );
      const voteOnlyArgs = ['vote', 'userName', 'userRol', 'tableNumber'];
      isVoteOnlyUpdate =
        providedArgs.every((arg) => voteOnlyArgs.includes(arg)) &&
        args.vote !== undefined;

      // Check what changed and log accordingly
      if (
        oldPerson &&
        args.vote !== undefined &&
        oldPerson.vote !== args.vote
      ) {
        // Vote status changed
        logPersonVote(
          user,
          updatedPerson,
          args.vote,
          args.tableNumber || updatedPerson.tableNumber
        );

        // Only publish PERSON_VOTED for vote-only updates (from table details)
        if (isVoteOnlyUpdate) {
          pubsub.publish('PERSON_VOTED', { personVoted: updatedPerson });
        }
      } else if (oldPerson) {
        // Other person data changed
        if (
          args.firstName !== undefined &&
          oldPerson.firstName !== args.firstName
        ) {
          changes.firstName = { old: oldPerson.firstName, new: args.firstName };
        }
        if (
          args.lastName !== undefined &&
          oldPerson.lastName !== args.lastName
        ) {
          changes.lastName = { old: oldPerson.lastName, new: args.lastName };
        }
        if (args.dni !== undefined && oldPerson.dni !== args.dni) {
          changes.dni = { old: oldPerson.dni, new: args.dni };
        }
        if (args.order !== undefined && oldPerson.order !== args.order) {
          changes.order = { old: oldPerson.order, new: args.order };
        }
        if (args.address !== undefined && oldPerson.address !== args.address) {
          changes.address = { old: oldPerson.address, new: args.address };
        }
        if (args.message !== undefined && oldPerson.message !== args.message) {
          changes.message = { old: oldPerson.message, new: args.message };
        }
        if (
          args.affiliate !== undefined &&
          oldPerson.affiliate !== args.affiliate
        ) {
          changes.affiliate = { old: oldPerson.affiliate, new: args.affiliate };
        }
        if (args.referer !== undefined && oldPerson.referer !== args.referer) {
          changes.referer = { old: oldPerson.referer, new: args.referer };
        }
        if (args.driver !== undefined && oldPerson.driver !== args.driver) {
          changes.driver = { old: oldPerson.driver, new: args.driver };
        }

        if (Object.keys(changes).length > 0) {
          hasNonVoteChanges = true;
          logAction(
            'PERSON_UPDATED',
            user,
            {
              type: 'person',
              id: updatedPerson._id,
              identifier: `${updatedPerson.lastName}, ${updatedPerson.firstName} (DNI: ${updatedPerson.dni})`,
              order: updatedPerson.order,
              tableNumber: args.tableNumber || updatedPerson.tableNumber,
            },
            changes
          );
        }
      }

      // Also publish a general person update event for non-vote changes
      if (hasNonVoteChanges || !isVoteOnlyUpdate) {
        pubsub.publish('PERSON_UPDATED', { personUpdated: updatedPerson });
      }

      return updatedPerson;
    },
  },

  // * Query for searching parent data

  Table: {
    persons: async (parent) => {
      // Only load persons when explicitly requested and limit the results
      return await Person.find({ tableId: parent._id })
        .sort({ order: 1 })
        .limit(1000) // Prevent loading too many at once
        .lean();
    },
    totalPersons: async (parent) => {
      // Use cached value if available from aggregation
      if (parent.totalPersons !== undefined) return parent.totalPersons;
      return await Person.countDocuments({ tableId: parent._id });
    },
    voted: async (parent) => {
      // Use cached value if available from aggregation
      if (parent.voted !== undefined) return parent.voted;
      return await Person.countDocuments({ tableId: parent._id, vote: true });
    },
    factions: async (parent) => {
      return await Faction.find({ tableId: parent._id }).lean();
    },
  },
  Person: {
    table: async (parent) => {
      // Use lean() for better performance when we don't need full Mongoose documents
      return await Table.findById(parent.tableId).lean();
    },
  },
  User: {
    assignedTable: async (parent) => {
      if (!parent.assignedTableId) return null;
      return await Table.findById(parent.assignedTableId).lean();
    },
  },
  Faction: {
    config: async (parent) =>
      await FactionConfig.findById(parent.configId).lean(),
    table: async (parent) => await Table.findById(parent.tableId).lean(),
  },

  // * ...

  // * Subscription resolvers
  Subscription: {
    personVoted: {
      subscribe: () => pubsub.asyncIterator('PERSON_VOTED'),
    },
    personUpdated: {
      subscribe: () => pubsub.asyncIterator('PERSON_UPDATED'),
    },
    tableChange: {
      subscribe: () => pubsub.asyncIterator('TABLE_CHANGED'),
    },
    personAdded: {
      subscribe: () => pubsub.asyncIterator('PERSON_ADDED'),
    },
    personDeleted: {
      subscribe: () => pubsub.asyncIterator('PERSON_DELETED'),
    },
    tableAdded: {
      subscribe: () => pubsub.asyncIterator('TABLE_ADDED'),
    },
    tableDeleted: {
      subscribe: () => pubsub.asyncIterator('TABLE_DELETED'),
    },
    multiplePersonsAdded: {
      subscribe: () => pubsub.asyncIterator('MULTIPLE_PERSONS_ADDED'),
    },
    factionConfigAdded: {
      subscribe: () => pubsub.asyncIterator('FACTION_CONFIG_ADDED'),
    },
    factionConfigDeleted: {
      subscribe: () => pubsub.asyncIterator('FACTION_CONFIG_DELETED'),
    },
    factionVotesSend: {
      subscribe: () => pubsub.asyncIterator('FACTION_VOTES_SEND'),
    },
    factionVotesUpdate: {
      subscribe: () => pubsub.asyncIterator('FACTION_VOTES_UPDATE'),
    },
    factionConfigUpdate: {
      subscribe: () => pubsub.asyncIterator('FACTION_CONFIG_UPDATE'),
    },
    userAdded: {
      subscribe: () => pubsub.asyncIterator('USER_ADDED'),
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator('USER_DELETED'),
    },
    userTableAssignmentUpdated: {
      subscribe: () => pubsub.asyncIterator('USER_TABLE_ASSIGNMENT_UPDATED'),
    },
    factionDeleted: {
      subscribe: () => pubsub.asyncIterator('FACTION_DELETE'),
    },
    alert: {
      subscribe: () => pubsub.asyncIterator('ALERT'),
    },
    dataSaved: {
      subscribe: () => pubsub.asyncIterator('DATA_SAVED'),
    },
  },
  // * ...
};
