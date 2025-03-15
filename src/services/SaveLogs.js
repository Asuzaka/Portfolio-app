const fs = require("fs");
function WriteLogs(text, server, dirLocation) {
  fs.writeFileSync(
    `${dirLocation}/logs/${new Date().toLocaleDateString()}.txt`,
    text,
    {
      encoding: "utf-8",
    }
  );
  server.close(() => {
    process.exit(1);
  });
}

function Logger(error, server, dirLocation) {
  console.log(`Shutting down the server due to Unhandled Rejection`);
  const message = `${new Date().toLocaleTimeString()} ==>  ${error.name} \n ${
    error.stack
  } \n`;

  if (fs.existsSync(`${dirLocation}/logs`)) {
    if (
      fs.existsSync(
        `${dirLocation}/logs/${new Date().toLocaleDateString()}.txt`
      )
    ) {
      const previousLogs = fs.readFileSync(
        `${dirLocation}/logs/${new Date().toLocaleDateString()}.txt`,
        { encoding: "utf-8" }
      );
      WriteLogs(`${previousLogs}\n${message}`, server, dirLocation);
    } else {
      WriteLogs(message, server, dirLocation);
    }
  } else {
    fs.mkdirSync(`${dirLocation}/logs`);
    WriteLogs(message, server, dirLocation);
  }
}

module.exports = Logger;
