// * Importing required models
import Table from "../models/Table.js";
import Person from "../models/Person.js";
import FactionConfig from "../models/FactionConfig.js";
import Faction from "../models/Faction.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";

import { logger } from "../utils/logger.js";

import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    // * Query resolvers for Users
    users: async () => User.find(),
    // * ...

    // * Query resolvers for Table
    tables: async () => await Table.find().sort({ number: 1 }),
    table: async (_, { _id }) => await Table.findById(_id),
    // * ...

    // * Query resolvers for Person

    persons: async () => await Person.find().sort({ tableNumber: 1, order: 1 }),
    person: async (_, { _id }) => await Person.findById(_id),

    // * Quantity
    personTotal: async () => await Person.collection.countDocuments(),
    personVoted: async () =>
      await Person.collection.countDocuments({ vote: true }),
    personNoVoted: async () =>
      await Person.collection.countDocuments({ vote: false }),
    votedPercent: async () =>
      ((await Person.collection.countDocuments({ vote: true })) /
        (await Person.collection.countDocuments())) *
      100,

    usersQuantity: async () => await User.collection.countDocuments(),

    tableTotal: async (_, { _id }) =>
      await Person.find({ tableId: _id }).countDocuments(),
    tableVoteTotal: async (_, { _id }) =>
      await Person.find({ tableId: _id }).countDocuments({ vote: true }),
    tableNoVoteTotal: async (_, { _id }) =>
      await Person.find({ tableId: _id }).countDocuments({ vote: false }),
    tableVoteTotalPercent: async (_, { _id }) =>
      (
        ((await Person.find({ tableId: _id }).countDocuments({ vote: true })) /
          (await Person.find({ tableId: _id }).countDocuments())) *
        100
      ).toFixed(2),

    totalAbiertaStatus: async () =>
      await Table.collection.countDocuments({ status: "Abierta" }),
    totalCerradaStatus: async () =>
      await Table.collection.countDocuments({ status: "Cerrada" }),
    totalDatosEnviadosStatus: async () =>
      await Table.collection.countDocuments({ status: "DatosEnviados" }),

    // * ...

    // * Query resolvers for Faction Config
    factionsConfig: async () => await FactionConfig.find(),
    anyFaction: async () => Faction.countDocuments(),

    factionChartJS: async () => {
      var configs = await FactionConfig.find();
      let confi = configs.map((conf) => ({
        id: conf._id.toHexString(),
        name: conf.name,
        color: conf.color,
        position: conf.position,
        votes: 0,
        percentage: 0,
        seats: 0,
      }));
      var factions = await Faction.find();
      factions.map((faction) => {
        const searchObject = confi.find(
          (cn) => cn.id == faction.configId.toHexString()
        );
        searchObject.votes += faction.votes;
      });
      return JSON.stringify(confi);
    },
    // * ...
  },

  Mutation: {
    // * Mutation for Auth Register
    registerUser: async (
      _,
      { registerInput: { username, name, password, rol } }
    ) => {
      const oldUser = await User.findOne({ username });
      if (oldUser) {
        throw new Error("El Usuario ya existe!");
      }
      var encryptedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        name,
        rol,
        password: encryptedPassword,
      });
      const token = Jwt.sign(
        {
          user_id: newUser._id,
          username,
          name,
          rol,
        },
        "UNFASE_STRINGYFIED",
        {
          expiresIn: "24h",
        }
      );
      newUser.token = token;
      const savedUser = await newUser.save();
      pubsub.publish("USER_ADDED", { userAdded: savedUser });
      return savedUser;
    },

    loginUser: async (_, { loginInput: { username, password } }) => {
      const user = await User.findOne({ username });
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = Jwt.sign(
          {
            user_id: user._id,
            username,
            name: user.name,
            rol: user.rol,
          },
          "UNFASE_STRINGYFIED",
          {
            expiresIn: "24h",
          }
        );
        user.token = token;
        return user;
      } else {
        throw new Error("Incorrect Usuario o Contraseña");
      }
    },

    deleteUser: async (_, { _id }) => {
      const deletedUser = await User.findByIdAndDelete(_id);
      if (!deletedUser) throw new Error("User not found");
      await pubsub.publish("USER_DELETED", {
        userDeleted: deletedUser,
      });
      return deletedUser;
    },
    // * ...

    // * Mutation CUD resolvers for Table

    createTable: async (_, args) => {
      const table = new Table({
        number: args.number,
        description: args.description,
        status: args.status,
      });
      const savedTable = await table.save();
      pubsub.publish("TABLE_ADDED", { tableAdded: savedTable });
      return savedTable;
    },

    deleteTable: async (_, { _id }) => {
      const deletedTable = await Table.findByIdAndDelete(_id);
      const deleteTablePersons = await Person.deleteMany({ tableId: _id });
      const deleteFactions = await Faction.deleteMany({ tableId: _id });
      if (!deletedTable) throw new Error("Table not found");
      pubsub.publish("TABLE_DELETED", { tableDeleted: deletedTable });
      return deletedTable;
    },

    updateTable: async (_, args) => {
      const updatedTable = await Table.findByIdAndUpdate(args._id, args, {
        new: true,
      });
      logger.info(
        `El usuario ${args.userName} (${args.userRol}) cambió el estado de la Mesa #${args.number} a ${args.status}`,
        { action: "tableStatus" }
      );
      if (!updatedTable) throw new Error("Table not found");
      pubsub.publish("TABLE_CHANGED", { tableChange: updatedTable });
      return updatedTable;
    },

    // * ...

    // * Mutation CUD resolvers for Faction
    createFactionConfig: async (_, { name, color, position }) => {
      const factionConfig = new FactionConfig({
        name,
        color,
        position,
      });
      const factionConfigSaved = await factionConfig.save();
      pubsub.publish("FACTION_CONFIG_ADDED", {
        factionConfigAdded: factionConfigSaved,
      });
      return factionConfigSaved;
    },

    deleteFactionConfig: async (_, { _id }) => {
      const deletedFactionConfig = await FactionConfig.findByIdAndDelete(_id);
      if (!deletedFactionConfig) throw new Error("Faction Config not found");
      pubsub.publish("FACTION_CONFIG_DELETED", {
        factionConfigDeleted: deletedFactionConfig,
      });
      return deletedFactionConfig;
    },

    updateFactionConfig: async (_, args) => {
      const updatedFactionConfig = await FactionConfig.findByIdAndUpdate(
        args._id,
        args,
        {
          new: true,
        }
      );
      if (!updatedFactionConfig) throw new Error("FactionConfig not found");
      pubsub.publish("FACTION_CONFIG_UPDATE", {
        factionConfigUpdate: updatedFactionConfig,
      });
      return updatedFactionConfig;
    },

    createFaction: async (_, { configId, votes, tableId }) => {
      const tableFound = await Table.findById(tableId, {
        new: true,
      });

      const configFound = await FactionConfig.findById(configId, {
        new: true,
      });

      if (!tableFound) throw new Error("Table not found");
      if (!configFound) throw new Error("Config not found");

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
      if (!updatedFaction) throw new Error("Faction not found");
      return updatedFaction;
    },

    deleteFaction: async (_, { _id, status }) => {
      const getDeletedFactions = await Faction.find({ tableId: _id });
      const deleteFactions = await Faction.deleteMany({ tableId: _id });
      if (!deleteFactions) throw new Error("Table without Factions not found");
      pubsub.publish("FACTION_DELETE", {
        factionDeleted: getDeletedFactions,
      });
      const updatedTable = await Table.findByIdAndUpdate(
        _id,
        { status },
        {
          new: true,
        }
      );
      if (!updatedTable) throw new Error("Table not found");
      pubsub.publish("TABLE_CHANGED", { tableChange: updatedTable });
      return deleteFactions;
    },

    setMultipleFactionRecord: async (
      args,
      { data, userName, userRol, tableNumber }
    ) => {
      const factionList = [];
      data.map(async (faction) => {
        const tableFound = await Table.findById(faction.table, {
          new: true,
        });

        const configFound = await FactionConfig.findById(faction.config, {
          new: true,
        });

        if (!tableFound) throw new Error("Table not found");
        if (!configFound) throw new Error("Faction Config not found");

        const factionObj = new Faction({
          configId: faction.config,
          votes: faction.votes,
          tableId: faction.table,
        });
        const factionSaved = await factionObj.save();
        factionList.push(factionSaved);
      });
      logger.info(
        `El usuario ${userName} (${userRol}) envió los votos de la Mesa #${tableNumber}`,
        { data, action: "voteSend" }
      );
      pubsub.publish("FACTION_VOTES_SEND", {
        factionVotesSend: `Faction Votes Set`,
      });
      return `Faction Records Saved`;
    },

    updateMultipleFactionRecord: async (
      args,
      { data, userName, userRol, tableNumber }
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
        if (!updatedFaction) throw new Error("Faction not found");

        factionList.push(updatedFaction);
      });
      logger.info(
        `El usuario ${userName} (${userRol}) editó los votos de la Mesa #${tableNumber}`,
        { data, action: "voteEdit" }
      );
      pubsub.publish("FACTION_VOTES_UPDATE", {
        factionVotesUpdate: `Faction Votes Updated`,
      });
      return `Factions Updated Successfully`;
    },
    // * ...

    // * Mutation for affiliate
    setMultipleAffiliate: async (args, { data }) => {
      data.map(async (record) => {
        const affiliateRecord = await Person.findOne({ dni: record.dni });
        affiliateRecord &&
          (await Person.findByIdAndUpdate(affiliateRecord._id, {
            affiliate: true,
          }));
      });
      return `Records Updated Successfully`;
    },
    // * ...

    // * Mutation CUD resolvers for Person

    createPerson: async (_, args) => {
      const tableFound = await Table.findById(args.tableId, {
        new: true,
      });

      if (!tableFound) throw new Error("Table not found");

      const person = new Person({
        firstName: args.firstName,
        lastName: args.lastName,
        dni: args.dni,
        vote: args.vote,
        order: args.order,
        address: args.address,
        message: args.message,
        affiliate: args.affiliate,
        tableId: args.tableId,
        tableNumber: args.tableNumber,
      });
      const personSaved = await person.save();
      logger.info(
        `El usuario ${args.userName} (${args.userRol}) agregó un nuevo votante en Mesa #${args.tableNumber}: Orden #${args.order}, ${args.lastName}, ${args.firstName}, DNI: ${args.dni}`,
        { action: "personAdded" }
      );
      pubsub.publish("PERSON_ADDED", { personAdded: personSaved });
      return personSaved;
    },

    setMultipleRecord: async (args, { data }) => {
      let personList = [];
      data.map(async (person) => {
        const tableFound = await Table.findById(person.table, {
          new: true,
        });

        if (!tableFound) throw new Error("Table not found");

        const personObj = new Person({
          firstName: person.firstName,
          lastName: person.lastName,
          dni: person.dni,
          vote: person.vote,
          order: person.order,
          address: person.address,
          message: person.message,
          affiliate: person.affiliate,
          tableId: person.table,
          tableNumber: person.tableNumber,
        });
        const personSaved = await personObj.save();
        personList.push(personSaved);
      });

      pubsub.publish("MULTIPLE_PERSONS_ADDED", {
        multiplePersonsAdded: `${personList}`,
      });
      return `${personList}`;
    },

    setMassiveRecord: async (args, { data }) => {
      const tableNumbers = data.map(({ tableNumber }) => tableNumber);
      const tablesUnique = [...new Set(tableNumbers)];
      await Table.insertMany(
        tablesUnique.map((number) => {
          return {
            number,
            status: "Abierta",
            description: "",
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
                      message: "",
                      affiliate: person.affiliate,
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
        .then(pubsub.publish("DATA_SAVED", { data: "Total Data Saved" }));
    },

    deletePerson: async (_, { _id }) => {
      const deletedPerson = await Person.findByIdAndDelete(_id, {
        new: true,
      });
      if (!Person) throw new Error("Person not found");
      pubsub.publish("PERSON_DELETED", { personDeleted: deletedPerson });
      return deletedPerson;
    },

    updatePerson: async (_, args) => {
      const updatedPerson = await Person.findByIdAndUpdate(args._id, args, {
        new: true,
      });
      if (!updatedPerson) throw new Error("Person not found");
      logger.info(
        `${
          args.vote === true
            ? `El usuario ${args.userName} (${args.userRol}) marcó el voto de ${args.lastName}, ${args.firstName}, DNI: ${args.dni} de orden ${args.order} en la mesa #${args.tableNumber}`
            : `El usuario ${args.userName} (${args.userRol}) desmarcó el voto de ${args.lastName}, ${args.firstName}, DNI: ${args.dni} de orden ${args.order} en la mesa #${args.tableNumber}`
        }`,
        { action: "personVoted" }
      );
      pubsub.publish("PERSON_VOTED", { personVoted: updatedPerson });
      return updatedPerson;
    },

    // * ...
  },

  // * Query for searching parent data

  Table: {
    persons: async (parent) =>
      await Person.find({ tableId: parent._id }).sort({ order: 1 }),
    totalPersons: async (parent) =>
      await Person.find({ tableId: parent._id }).countDocuments(),
    voted: async (parent) =>
      await Person.find({ tableId: parent._id }).countDocuments({ vote: true }),
    factions: async (parent) => await Faction.find({ tableId: parent._id }),
  },
  Person: {
    table: async (parent) => await Table.findById(parent.tableId),
  },
  Faction: {
    config: async (parent) => await FactionConfig.findById(parent.configId),
    table: async (parent) => await Table.findById(parent.tableId),
  },

  // * ...

  // * Subscription resolvers
  Subscription: {
    personVoted: {
      subscribe: () => pubsub.asyncIterator("PERSON_VOTED"),
    },
    tableChange: {
      subscribe: () => pubsub.asyncIterator("TABLE_CHANGED"),
    },
    personAdded: {
      subscribe: () => pubsub.asyncIterator("PERSON_ADDED"),
    },
    personDeleted: {
      subscribe: () => pubsub.asyncIterator("PERSON_DELETED"),
    },
    tableAdded: {
      subscribe: () => pubsub.asyncIterator("TABLE_ADDED"),
    },
    tableDeleted: {
      subscribe: () => pubsub.asyncIterator("TABLE_DELETED"),
    },
    multiplePersonsAdded: {
      subscribe: () => pubsub.asyncIterator("MULTIPLE_PERSONS_ADDED"),
    },
    factionConfigAdded: {
      subscribe: () => pubsub.asyncIterator("FACTION_CONFIG_ADDED"),
    },
    factionConfigDeleted: {
      subscribe: () => pubsub.asyncIterator("FACTION_CONFIG_DELETED"),
    },
    factionVotesSend: {
      subscribe: () => pubsub.asyncIterator("FACTION_VOTES_SEND"),
    },
    factionVotesUpdate: {
      subscribe: () => pubsub.asyncIterator("FACTION_VOTES_UPDATE"),
    },
    factionConfigUpdate: {
      subscribe: () => pubsub.asyncIterator("FACTION_CONFIG_UPDATE"),
    },
    userAdded: {
      subscribe: () => pubsub.asyncIterator("USER_ADDED"),
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator("USER_DELETED"),
    },
    factionDeleted: {
      subscribe: () => pubsub.asyncIterator("FACTION_DELETE"),
    },
    alert: {
      subscribe: () => pubsub.asyncIterator("ALERT"),
    },
    dataSaved: {
      subscribe: () => pubsub.asyncIterator("DATA_SAVED"),
    },
  },
  // * ...
};
