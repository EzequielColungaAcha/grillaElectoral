import { PubSub } from 'graphql-subscriptions';
import User from '../models/User.js';
import Table from '../models/Table.js';
import Person from '../models/Person.js';
import Faction from '../models/Faction.js';
import FactionConfig from '../models/FactionConfig.js';
import Log from '../models/Log.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  logAction,
  logPersonVote,
  logPersonAdded,
  logPersonDeleted,
  logTableStatusChange,
  logVotesSent,
  logVotesUpdated,
  logUserAction,
  logTableAction,
  logFactionAction,
} from '../utils/logger.js';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    // User queries
    users: async () => {
      try {
        const users = await User.find().populate('assignedTableId');
        return users.map((user) => ({
          ...user.toObject(),
          assignedTable: user.assignedTableId,
        }));
      } catch (error) {
        throw new Error(error);
      }
    },

    usersQuantity: async () => {
      try {
        return await User.countDocuments();
      } catch (error) {
        throw new Error(error);
      }
    },

    // Table queries
    tables: async () => {
      try {
        const tables = await Table.find().sort({ number: 1 });
        const result = [];

        for (const table of tables) {
          const persons = await Person.find({ tableId: table._id });
          const factions = await Faction.find({ tableId: table._id });

          result.push({
            ...table.toObject(),
            persons,
            totalPersons: persons.length,
            voted: persons.filter((p) => p.vote).length,
            factions,
          });
        }

        return result;
      } catch (error) {
        throw new Error(error);
      }
    },

    tablesForFiscal: async (_, { tableId }) => {
      try {
        let query = {};
        if (tableId) {
          query._id = tableId;
        }

        const tables = await Table.find(query).sort({ number: 1 });
        const result = [];

        for (const table of tables) {
          const persons = await Person.find({ tableId: table._id });
          const factions = await Faction.find({ tableId: table._id });

          result.push({
            ...table.toObject(),
            totalPersons: persons.length,
            voted: persons.filter((p) => p.vote).length,
            factions,
          });
        }

        return result;
      } catch (error) {
        throw new Error(error);
      }
    },

    table: async (_, { _id }) => {
      try {
        const table = await Table.findById(_id);
        if (!table) throw new Error('Table not found');

        const persons = await Person.find({ tableId: _id }).sort({ order: 1 });
        const factions = await Faction.find({ tableId: _id }).populate(
          'configId'
        );

        return {
          ...table.toObject(),
          persons,
          factions: factions.map((f) => ({
            ...f.toObject(),
            config: f.configId,
          })),
          totalPersons: persons.length,
          voted: persons.filter((p) => p.vote).length,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    tablesWithCounts: async () => {
      try {
        const tables = await Table.find().sort({ number: 1 });
        const result = [];

        for (const table of tables) {
          const persons = await Person.find({ tableId: table._id });
          const factions = await Faction.find({ tableId: table._id });

          result.push({
            ...table.toObject(),
            totalPersons: persons.length,
            voted: persons.filter((p) => p.vote).length,
            factionsCount: factions.length,
          });
        }

        return result;
      } catch (error) {
        throw new Error(error);
      }
    },

    // Person queries
    persons: async (
      _,
      { limit = 50, offset = 0, tableNumber, search, vote, affiliate, referer }
    ) => {
      try {
        let query = {};

        if (tableNumber) {
          query.tableNumber = tableNumber;
        }

        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { dni: { $regex: search, $options: 'i' } },
          ];
        }

        if (vote !== undefined) {
          query.vote = vote;
        }

        if (affiliate !== undefined) {
          query.affiliate = affiliate;
        }

        if (referer) {
          query.referer = referer;
        }

        const totalCount = await Person.countDocuments(query);
        const persons = await Person.find(query)
          .sort({ tableNumber: 1, order: 1 })
          .skip(offset)
          .limit(limit);

        return {
          persons,
          totalCount,
          hasMore: offset + limit < totalCount,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    person: async (_, { _id }) => {
      try {
        const person = await Person.findById(_id).populate('tableId');
        if (!person) throw new Error('Person not found');

        return {
          ...person.toObject(),
          table: person.tableId,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    personsCount: async (
      _,
      { tableNumber, search, vote, affiliate, referer }
    ) => {
      try {
        let query = {};

        if (tableNumber) {
          query.tableNumber = tableNumber;
        }

        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { dni: { $regex: search, $options: 'i' } },
          ];
        }

        if (vote !== undefined) {
          query.vote = vote;
        }

        if (affiliate !== undefined) {
          query.affiliate = affiliate;
        }

        if (referer) {
          query.referer = referer;
        }

        return await Person.countDocuments(query);
      } catch (error) {
        throw new Error(error);
      }
    },

    // Statistics queries
    personTotal: async () => {
      try {
        return await Person.countDocuments();
      } catch (error) {
        throw new Error(error);
      }
    },

    personVoted: async () => {
      try {
        return await Person.countDocuments({ vote: true });
      } catch (error) {
        throw new Error(error);
      }
    },

    personNoVoted: async () => {
      try {
        return await Person.countDocuments({ vote: false });
      } catch (error) {
        throw new Error(error);
      }
    },

    votedPercent: async () => {
      try {
        const total = await Person.countDocuments();
        const voted = await Person.countDocuments({ vote: true });
        return total > 0 ? (voted / total) * 100 : 0;
      } catch (error) {
        throw new Error(error);
      }
    },

    // Faction queries
    factionsConfig: async () => {
      try {
        return await FactionConfig.find().sort({ position: 1, name: 1 });
      } catch (error) {
        throw new Error(error);
      }
    },

    anyFaction: async () => {
      try {
        return await Faction.countDocuments();
      } catch (error) {
        throw new Error(error);
      }
    },

    factionChartJS: async () => {
      try {
        const factionConfigs = await FactionConfig.find();
        const result = [];

        for (const config of factionConfigs) {
          const factions = await Faction.find({ configId: config._id });
          const totalVotes = factions.reduce((sum, f) => sum + f.votes, 0);

          result.push({
            id: config._id,
            name: config.name,
            color: config.color,
            position: config.position,
            votes: totalVotes,
            percentage: 0,
            seats: 0,
          });
        }

        return JSON.stringify(result);
      } catch (error) {
        throw new Error(error);
      }
    },

    // Logs queries
    logs: async (_, { limit = 50, offset = 0, action, startDate, endDate }) => {
      try {
        let query = {};

        if (action) {
          query.action = action;
        }

        if (startDate || endDate) {
          query.timestamp = {};
          if (startDate) {
            query.timestamp.$gte = new Date(startDate);
          }
          if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            query.timestamp.$lte = endDateTime;
          }
        }

        const totalCount = await Log.countDocuments(query);
        const logs = await Log.find(query)
          .sort({ timestamp: -1 })
          .skip(offset)
          .limit(limit);

        return {
          logs: logs.map((log) => ({
            ...log.toObject(),
            id: log._id,
            changes: log.changes ? JSON.stringify(log.changes) : null,
            metadata: log.metadata ? JSON.stringify(log.metadata) : null,
          })),
          totalCount,
          hasMore: offset + limit < totalCount,
        };
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    // User mutations
    registerUser: async (_, { registerInput }) => {
      try {
        const { username, name, password, rol, assignedTableId } =
          registerInput;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error('El Usuario ya existe!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
          username,
          name,
          password: hashedPassword,
          rol,
          assignedTableId: assignedTableId || null,
        });

        const savedUser = await user.save();

        // Log user creation
        await logUserAction('USER_CREATED', null, savedUser);

        const token = jwt.sign(
          {
            user_id: savedUser._id,
            username: savedUser.username,
            name: savedUser.name,
            rol: savedUser.rol,
            assignedTable: assignedTableId
              ? await Table.findById(assignedTableId)
              : null,
          },
          'UNFASE_STRINGYFIED',
          { expiresIn: '24h' }
        );

        pubsub.publish('USER_ADDED', { userAdded: savedUser });

        return {
          ...savedUser.toObject(),
          token,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    loginUser: async (_, { loginInput }) => {
      try {
        const { username, password } = loginInput;

        const user = await User.findOne({ username }).populate(
          'assignedTableId'
        );
        if (!user) {
          throw new Error('Incorrect Usuario o Contraseña');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Incorrect Usuario o Contraseña');
        }

        const token = jwt.sign(
          {
            user_id: user._id,
            username: user.username,
            name: user.name,
            rol: user.rol,
            assignedTable: user.assignedTableId,
          },
          'UNFASE_STRINGYFIED',
          { expiresIn: '24h' }
        );

        return {
          username: user.username,
          name: user.name,
          rol: user.rol,
          token,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteUser: async (_, { _id }, { user: currentUser }) => {
      try {
        const userToDelete = await User.findById(_id);
        if (!userToDelete) {
          throw new Error('User not found');
        }

        await User.findByIdAndDelete(_id);

        // Log user deletion
        await logUserAction('USER_DELETED', currentUser, userToDelete);

        pubsub.publish('USER_DELETED', { userDeleted: userToDelete });
        return userToDelete;
      } catch (error) {
        throw new Error(error);
      }
    },

    updateUserTableAssignment: async (
      _,
      { _id, assignedTableId },
      { user: currentUser }
    ) => {
      try {
        const user = await User.findById(_id).populate('assignedTableId');
        if (!user) {
          throw new Error('User not found');
        }

        const oldTable = user.assignedTableId;
        const newTable = assignedTableId
          ? await Table.findById(assignedTableId)
          : null;

        user.assignedTableId = assignedTableId || null;
        const updatedUser = await user.save();
        await updatedUser.populate('assignedTableId');

        // Log table assignment change
        await logUserAction(
          'USER_TABLE_ASSIGNMENT_UPDATED',
          currentUser,
          updatedUser,
          {
            assignedTable: {
              old: oldTable ? `Mesa ${oldTable.number}` : 'Sin asignación',
              new: newTable ? `Mesa ${newTable.number}` : 'Sin asignación',
            },
          }
        );

        const result = {
          ...updatedUser.toObject(),
          assignedTable: updatedUser.assignedTableId,
        };

        pubsub.publish('USER_TABLE_ASSIGNMENT_UPDATED', {
          userTableAssignmentUpdated: result,
        });

        return result;
      } catch (error) {
        throw new Error(error);
      }
    },

    // Table mutations
    createTable: async (_, { number, description, status }, { user }) => {
      try {
        const existingTable = await Table.findOne({ number });
        if (existingTable) {
          throw new Error('Ya existe una mesa con ese número');
        }

        const table = new Table({ number, description, status });
        const savedTable = await table.save();

        // Log table creation
        await logTableAction('TABLE_CREATED', user, savedTable, { number });

        pubsub.publish('TABLE_ADDED', { tableAdded: savedTable });
        return savedTable;
      } catch (error) {
        throw new Error(error);
      }
    },

    updateTable: async (
      _,
      { _id, number, description, status, userName, userRol },
      { user }
    ) => {
      try {
        const table = await Table.findById(_id);
        if (!table) {
          throw new Error('Table not found');
        }

        const oldStatus = table.status;

        table.number = number;
        table.description = description;
        table.status = status;

        const updatedTable = await table.save();

        // Log status change if status changed
        if (oldStatus !== status) {
          await logTableStatusChange(user, updatedTable, status, oldStatus);
        } else {
          // Log general table update
          await logTableAction('TABLE_UPDATED', user, updatedTable, {
            number,
            description,
          });
        }

        pubsub.publish('TABLE_CHANGED', { tableChange: updatedTable });
        return updatedTable;
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteTable: async (_, { _id }, { user }) => {
      try {
        const table = await Table.findById(_id);
        if (!table) {
          throw new Error('Table not found');
        }

        // Delete associated persons and factions
        await Person.deleteMany({ tableId: _id });
        await Faction.deleteMany({ tableId: _id });

        await Table.findByIdAndDelete(_id);

        // Log table deletion
        await logTableAction('TABLE_DELETED', user, table);

        pubsub.publish('TABLE_DELETED', { tableDeleted: table });
        return table;
      } catch (error) {
        throw new Error(error);
      }
    },

    // Person mutations
    createPerson: async (_, args, { user }) => {
      try {
        const {
          firstName,
          lastName,
          dni,
          vote,
          order,
          address,
          message,
          affiliate,
          referer,
          driver,
          tableId,
          tableNumber,
          userName,
          userRol,
        } = args;

        const person = new Person({
          firstName,
          lastName,
          dni,
          vote,
          order,
          address,
          message,
          affiliate,
          referer,
          driver,
          tableId,
          tableNumber,
        });

        const savedPerson = await person.save();
        const populatedPerson = await Person.findById(savedPerson._id).populate(
          'tableId'
        );

        // Log person addition
        await logPersonAdded(user, savedPerson, tableNumber);

        pubsub.publish('PERSON_ADDED', {
          personAdded: {
            ...populatedPerson.toObject(),
            table: populatedPerson.tableId,
          },
        });

        return {
          ...populatedPerson.toObject(),
          table: populatedPerson.tableId,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    updatePerson: async (_, args, { user }) => {
      try {
        const { _id, vote, userName, userRol, tableNumber, ...updateFields } =
          args;

        const person = await Person.findById(_id);
        if (!person) {
          throw new Error('Person not found');
        }

        const oldVote = person.vote;

        // Update fields
        Object.keys(updateFields).forEach((key) => {
          if (updateFields[key] !== undefined && !key.startsWith('original')) {
            person[key] = updateFields[key];
          }
        });

        const updatedPerson = await person.save();
        const populatedPerson = await Person.findById(
          updatedPerson._id
        ).populate('tableId');

        // Log vote change if vote status changed
        if (vote !== undefined && oldVote !== vote) {
          await logPersonVote(user, updatedPerson, vote, tableNumber);

          pubsub.publish('PERSON_VOTED', {
            personVoted: {
              ...populatedPerson.toObject(),
              table: populatedPerson.tableId,
            },
          });
        } else {
          // Log general person update
          const changes = {};
          Object.keys(updateFields).forEach((key) => {
            if (
              !key.startsWith('original') &&
              updateFields[key] !== undefined
            ) {
              const originalKey = `original${
                key.charAt(0).toUpperCase() + key.slice(1)
              }`;
              if (
                args[originalKey] !== undefined &&
                args[originalKey] !== updateFields[key]
              ) {
                changes[key] = {
                  old: args[originalKey],
                  new: updateFields[key],
                };
              }
            }
          });

          if (Object.keys(changes).length > 0) {
            await logAction(
              'PERSON_UPDATED',
              user,
              {
                type: 'person',
                id: updatedPerson._id,
                identifier: `${updatedPerson.lastName}, ${updatedPerson.firstName} (DNI: ${updatedPerson.dni})`,
                order: updatedPerson.order,
                tableNumber: updatedPerson.tableNumber,
              },
              changes
            );
          }

          pubsub.publish('PERSON_UPDATED', {
            personUpdated: {
              ...populatedPerson.toObject(),
              table: populatedPerson.tableId,
            },
          });
        }

        return {
          ...populatedPerson.toObject(),
          table: populatedPerson.tableId,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    deletePerson: async (_, { _id }, { user }) => {
      try {
        const person = await Person.findById(_id).populate('tableId');
        if (!person) {
          throw new Error('Person not found');
        }

        await Person.findByIdAndDelete(_id);

        // Log person deletion
        await logPersonDeleted(user, person);

        pubsub.publish('PERSON_DELETED', {
          personDeleted: {
            ...person.toObject(),
            table: person.tableId,
          },
        });

        return {
          ...person.toObject(),
          table: person.tableId,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    setMultipleRecord: async (_, { data }, { user }) => {
      try {
        const records = [];
        const personNames = [];

        for (const record of data) {
          // Find or create table
          let table = await Table.findOne({
            number: parseInt(record.tableNumber),
          });
          if (!table) {
            table = new Table({
              number: parseInt(record.tableNumber),
              description: '',
              status: 'Abierta',
            });
            await table.save();
          }

          const person = new Person({
            firstName: record.firstName,
            lastName: record.lastName,
            dni: record.dni,
            vote: record.vote,
            order: record.order,
            address: record.address,
            message: record.message,
            affiliate: record.affiliate,
            referer: record.referer,
            tableId: table._id,
            tableNumber: table.number,
          });

          const savedPerson = await person.save();
          records.push(savedPerson);
          personNames.push(
            `${record.lastName}, ${record.firstName} (DNI: ${record.dni})`
          );
        }

        // Log bulk person addition
        await logAction(
          'BULK_PERSONS_ADDED',
          user,
          {
            type: 'table',
            identifier: `Mesa #${data[0]?.tableNumber}`,
          },
          {
            count: records.length,
            persons: personNames,
          }
        );

        pubsub.publish('MULTIPLE_PERSONS_ADDED', {
          multiplePersonsAdded: 'success',
        });
        return 'success';
      } catch (error) {
        throw new Error(error);
      }
    },

    setMassiveRecord: async (_, { data }, { user }) => {
      try {
        const tablesCreated = new Set();
        const personsAdded = [];
        const personNames = [];

        for (const record of data) {
          // Find or create table
          let table = await Table.findOne({
            number: parseInt(record.tableNumber),
          });
          if (!table) {
            table = new Table({
              number: parseInt(record.tableNumber),
              description: '',
              status: 'Abierta',
            });
            await table.save();
            tablesCreated.add(table.number);
          }

          const person = new Person({
            firstName: record.firstName,
            lastName: record.lastName,
            dni: record.dni,
            vote: false,
            order: record.order,
            address: record.address,
            affiliate: record.affiliate,
            referer: record.referer,
            driver: record.driver,
            tableId: table._id,
            tableNumber: table.number,
          });

          const savedPerson = await person.save();
          personsAdded.push(savedPerson);
          personNames.push(
            `${record.lastName}, ${record.firstName} (DNI: ${record.dni})`
          );
        }

        // Log massive data import
        await logAction(
          'MASSIVE_DATA_IMPORT',
          user,
          {
            type: 'system',
            identifier: 'Sistema',
          },
          {
            tablesCreated: tablesCreated.size,
            personsAdded: personsAdded.length,
            count: personsAdded.length,
            persons: personNames,
          }
        );

        pubsub.publish('MULTIPLE_PERSONS_ADDED', {
          multiplePersonsAdded: 'success',
        });
        return 'success';
      } catch (error) {
        throw new Error(error);
      }
    },

    // Faction mutations
    createFactionConfig: async (_, { name, color, position }, { user }) => {
      try {
        const factionConfig = new FactionConfig({ name, color, position });
        const savedConfig = await factionConfig.save();

        // Log faction config creation
        await logFactionAction('FACTION_CONFIG_CREATED', user, savedConfig, {
          name,
        });

        pubsub.publish('FACTION_CONFIG_ADDED', {
          factionConfigAdded: savedConfig,
        });
        return savedConfig;
      } catch (error) {
        throw new Error(error);
      }
    },

    updateFactionConfig: async (
      _,
      { _id, name, color, position },
      { user }
    ) => {
      try {
        const factionConfig = await FactionConfig.findById(_id);
        if (!factionConfig) {
          throw new Error('Faction config not found');
        }

        const oldName = factionConfig.name;
        const oldColor = factionConfig.color;
        const oldPosition = factionConfig.position;

        factionConfig.name = name;
        factionConfig.color = color;
        factionConfig.position = position;

        const updatedConfig = await factionConfig.save();

        // Log faction config update
        const changes = {};
        if (oldName !== name) changes.name = { old: oldName, new: name };
        if (oldColor !== color) changes.color = { old: oldColor, new: color };
        if (oldPosition !== position)
          changes.position = { old: oldPosition, new: position };

        await logFactionAction(
          'FACTION_CONFIG_UPDATED',
          user,
          updatedConfig,
          changes
        );

        pubsub.publish('FACTION_CONFIG_UPDATE', {
          factionConfigUpdate: updatedConfig,
        });
        return updatedConfig;
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteFactionConfig: async (_, { _id }, { user }) => {
      try {
        const factionConfig = await FactionConfig.findById(_id);
        if (!factionConfig) {
          throw new Error('Faction config not found');
        }

        // Delete associated factions
        await Faction.deleteMany({ configId: _id });
        await FactionConfig.findByIdAndDelete(_id);

        // Log faction config deletion
        await logFactionAction('FACTION_CONFIG_DELETED', user, factionConfig);

        pubsub.publish('FACTION_CONFIG_DELETED', {
          factionConfigDeleted: factionConfig,
        });
        return factionConfig;
      } catch (error) {
        throw new Error(error);
      }
    },

    setMultipleFactionRecord: async (
      _,
      { data, userName, userRol, tableNumber },
      { user }
    ) => {
      try {
        const votes = [];

        for (const record of data) {
          const table = await Table.findById(record.table);
          if (!table) continue;

          const faction = new Faction({
            configId: record.config,
            votes: record.votes,
            tableId: record.table,
          });

          const savedFaction = await faction.save();
          votes.push({
            faction: record.name,
            votes: record.votes,
          });
        }

        // Log votes sent
        await logVotesSent(user, { number: tableNumber }, votes);

        pubsub.publish('FACTION_VOTES_SEND', { factionVotesSend: 'success' });
        return 'success';
      } catch (error) {
        throw new Error(error);
      }
    },

    updateMultipleFactionRecord: async (
      _,
      { data, userName, userRol, tableNumber },
      { user }
    ) => {
      try {
        const votes = [];

        for (const record of data) {
          const faction = await Faction.findById(record._id);
          if (!faction) continue;

          faction.votes = record.votes;
          await faction.save();

          votes.push({
            faction: record.name,
            votes: record.votes,
          });
        }

        // Log votes updated
        await logVotesUpdated(user, { number: tableNumber }, votes);

        pubsub.publish('FACTION_VOTES_UPDATE', {
          factionVotesUpdate: 'success',
        });
        return 'success';
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteFaction: async (_, { _id, status }, { user }) => {
      try {
        const deletedFactions = await Faction.find({ tableId: _id });
        await Faction.deleteMany({ tableId: _id });

        if (status) {
          await Table.findByIdAndUpdate(_id, { status });
        }

        pubsub.publish('FACTION_DELETED', { factionDeleted: deletedFactions });
        return { acknowledged: true, deletedCount: deletedFactions.length };
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Subscription: {
    personVoted: {
      subscribe: () => pubsub.asyncIterator(['PERSON_VOTED']),
    },
    personUpdated: {
      subscribe: () => pubsub.asyncIterator(['PERSON_UPDATED']),
    },
    tableChange: {
      subscribe: () => pubsub.asyncIterator(['TABLE_CHANGED']),
    },
    personAdded: {
      subscribe: () => pubsub.asyncIterator(['PERSON_ADDED']),
    },
    personDeleted: {
      subscribe: () => pubsub.asyncIterator(['PERSON_DELETED']),
    },
    tableAdded: {
      subscribe: () => pubsub.asyncIterator(['TABLE_ADDED']),
    },
    tableDeleted: {
      subscribe: () => pubsub.asyncIterator(['TABLE_DELETED']),
    },
    multiplePersonsAdded: {
      subscribe: () => pubsub.asyncIterator(['MULTIPLE_PERSONS_ADDED']),
    },
    factionConfigAdded: {
      subscribe: () => pubsub.asyncIterator(['FACTION_CONFIG_ADDED']),
    },
    factionConfigDeleted: {
      subscribe: () => pubsub.asyncIterator(['FACTION_CONFIG_DELETED']),
    },
    factionConfigUpdate: {
      subscribe: () => pubsub.asyncIterator(['FACTION_CONFIG_UPDATE']),
    },
    factionVotesSend: {
      subscribe: () => pubsub.asyncIterator(['FACTION_VOTES_SEND']),
    },
    factionVotesUpdate: {
      subscribe: () => pubsub.asyncIterator(['FACTION_VOTES_UPDATE']),
    },
    userAdded: {
      subscribe: () => pubsub.asyncIterator(['USER_ADDED']),
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator(['USER_DELETED']),
    },
    userTableAssignmentUpdated: {
      subscribe: () => pubsub.asyncIterator(['USER_TABLE_ASSIGNMENT_UPDATED']),
    },
    factionDeleted: {
      subscribe: () => pubsub.asyncIterator(['FACTION_DELETED']),
    },
  },
};
