module.exports = client => {
  client.setInterval(() => {
    client.messagesPerSecond = 0;
    client.commandsPerSecond = 0;
  }, 1100);
};