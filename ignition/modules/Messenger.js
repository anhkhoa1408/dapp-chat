const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MessengerModule = buildModule("MessengerModule", (m) => {
  const messenger = m.contract("Messenger");

  return { messenger };
});

module.exports = MessengerModule;
